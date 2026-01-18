
import { prisma } from './src/lib/db';
import "dotenv/config";

async function main() {
    console.log('Clearing EngineOutputs...');
    await prisma.engineOutput.deleteMany({});

    console.log('Clearing EngineRuns...');
    await prisma.engineRun.deleteMany({});

    console.log('Done. Limits reset.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
