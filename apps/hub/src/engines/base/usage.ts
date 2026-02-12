
import { prisma } from '../../lib/db';

export type UserTier = 'free' | 'pro';

export async function getUserTier(userId: string): Promise<UserTier> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { tier: true }
        });

        if (!user) return 'free';
        return (user.tier as UserTier) || 'free';
    } catch (e) {
        console.error("Error getting user tier", e);
        return 'free';
    }
}

export async function getUsage(userId: string, engineId: string) {
    const now = new Date();

    try {
        const usage = await prisma.usageCounter.findUnique({
            where: {
                userId_engineId: { userId, engineId }
            }
        });

        if (!usage || usage.periodEnd < now) {
            return { count: 0, periodStart: null, periodEnd: null };
        }

        return {
            count: usage.count,
            periodStart: usage.periodStart,
            periodEnd: usage.periodEnd
        };
    } catch (e) {
        // If table doesn't exist yet or other error, assume 0 usage
        return { count: 0, periodStart: null, periodEnd: null };
    }
}

export async function incrementUsage(userId: string, engineId: string) {
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    try {
        // Upsert handles both create and update if collision on unique constraint
        const updated = await prisma.usageCounter.upsert({
            where: { userId_engineId: { userId, engineId } },
            update: {
                count: { increment: 1 }
                // We do NOT reset periodStart/End on update, unless expired.
                // But upsert logic is tricky if expired. 
                // Better logic:
                // Check if expired first?
            },
            create: {
                userId,
                engineId,
                periodStart: now,
                periodEnd,
                count: 1
            }
        });

        // If updated but was expired, we need to reset it.
        if (updated.periodEnd < now) {
            const reset = await prisma.usageCounter.update({
                where: { id: updated.id },
                data: {
                    periodStart: now,
                    periodEnd,
                    count: 1
                }
            });
            return 1;
        }

        return updated.count;
    } catch (e) {
        console.error("Error incrementing usage", e);
        return 1;
    }
}

export function isWithinLimit(tier: UserTier, limit: number, currentUsage: number): boolean {
    if (tier === 'pro') return true;
    if (limit === -1) return true;
    return currentUsage < limit;
}
