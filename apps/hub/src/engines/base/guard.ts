
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/db';
import { getUserTier, getUsage, isWithinLimit } from './usage';

export interface AccessCheckResult {
    authorized: boolean;
    user?: any; // Prisma User
    tier?: 'free' | 'pro';
    usage?: number;
    response?: NextResponse; // Pre-formed error response if failed
}

export async function checkEngineAccess(req: NextRequest, engineId: string, limitObj: { free: number; pro: number }): Promise<AccessCheckResult> {
    // Check for cookie session
    const token = req.cookies.get('signal_session')?.value;

    if (!token) {
        // DEV MODE BYPASS: If no session, try to find/create a dev user
        if (process.env.NODE_ENV === 'development') {
            console.log("DEV MODE: No session found, attempting bypass...");

            // Try to find ANY user to impersonate
            let devUser = await prisma.user.findFirst();

            // If DB is empty, create a dev user
            if (!devUser) {
                try {
                    devUser = await prisma.user.create({
                        data: {
                            email: 'dev@local',
                            tier: 'pro', // Default to pro for testing
                            hasAgencyAccess: true,
                            id: 'dev-user-id'
                        }
                    });
                    console.log("DEV MODE: Created dev user 'dev@local'");
                } catch (e) {
                    console.error("DEV MODE: Failed to create dev user", e);
                    // Fallback to purely mock object (db writes will fail)
                    return {
                        authorized: true,
                        user: { id: 'mock-dev-id', email: 'dev@local', tier: 'pro' } as any,
                        tier: 'pro',
                        usage: 0
                    };
                }
            }

            if (devUser) {
                console.log(`DEV MODE: Impersonating ${devUser.email} (${devUser.id})`);
                const usage = await getUsage(devUser.id, engineId);
                const tier = (devUser.tier as 'free' | 'pro') || 'free';

                return {
                    authorized: true,
                    user: devUser,
                    tier,
                    usage: usage.count
                };
            }
        }

        return {
            authorized: false,
            response: NextResponse.json({ error: 'Unauthorized: No session' }, { status: 401 })
        };
    }

    try {
        const session = await prisma.session.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!session || session.expiresAt < new Date()) {
            return {
                authorized: false,
                response: NextResponse.json({ error: 'Unauthorized: Invalid/Expired session' }, { status: 401 })
            };
        }

        const user = session.user;
        const tier = (user.tier as 'free' | 'pro') || 'free';

        // Get usage
        let usage = await getUsage(user.id, engineId);

        // If usage period expired, usage count might be stale until incremented, but usage logic handles period checks (returns 0 if expired).
        if (!usage.periodEnd) {
            usage = { count: 0, periodStart: new Date(), periodEnd: new Date() };
        }

        const limit = tier === 'pro' ? limitObj.pro : limitObj.free;

        if (!isWithinLimit(tier, limit, usage.count)) {
            return {
                authorized: false,
                tier,
                usage: usage.count,
                response: NextResponse.json({
                    error: 'Usage limit exceeded',
                    current: usage.count,
                    limit,
                    upgradeRequired: true
                }, { status: 403 })
            };
        }

        return {
            authorized: true,
            user,
            tier,
            usage: usage.count
        };

    } catch (e: any) {
        console.error("Auth Guard Error:", e);
        return {
            authorized: false,
            response: NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
        };
    }
}
