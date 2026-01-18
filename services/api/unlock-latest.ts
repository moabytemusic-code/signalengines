
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function unlockLatest() {
    try {
        const lastRun = await prisma.engineRun.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        if (!lastRun) {
            console.log("No runs found!");
            return;
        }

        console.log(`Found Run: ${lastRun.id} (Engine: ${lastRun.engineId})`);
        console.log(`Current UserID: ${lastRun.userId}`);
        console.log(`Current AnonID: ${lastRun.anonymousId}`);

        let userId = lastRun.userId;

        if (!userId) {
            console.log("Run is anonymous. Creating/Linking a temp user to enable unlocking...");
            // Create or get a temp user
            const email = "temp_unlock_" + Date.now() + "@example.com";
            const user = await prisma.user.create({
                data: { email }
            });
            userId = user.id;

            // Update the run to belong to this user BUT keep anonymousId so browser can still claim it
            await prisma.engineRun.update({
                where: { id: lastRun.id },
                data: { userId: userId }
            });
            console.log(`Assigned Run to Temp User: ${userId}`);
        }

        // Create Entitlement
        await prisma.engineEntitlement.upsert({
            where: {
                userId_engineId: {
                    userId: userId,
                    engineId: lastRun.engineId
                }
            },
            create: {
                userId: userId,
                engineId: lastRun.engineId,
                hasAccess: true
            },
            update: {
                hasAccess: true
            }
        });

        console.log("✅ UNLOCKED! Refresh your browser.");

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

unlockLatest();
