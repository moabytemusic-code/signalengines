import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const engines = await prisma.engineDefinition.findMany();
    console.log(JSON.stringify(engines, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
