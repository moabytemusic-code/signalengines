const fs = require('fs');
const path = 'services/api/src/index.ts';
let content = fs.readFileSync(path, 'utf8');

const injection = `
app.get("/public/articles", async (req, res) => {
    try {
        const { engine_id, limit } = req.query;
        const take = limit ? parseInt(limit as string) : 50;
        const where: any = { published: true };
        if (engine_id) where.engineId = engine_id;

        const articles = await prisma.seoPage.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take,
            select: {
                slug: true,
                title: true,
                description: true,
                engineId: true,
                updatedAt: true
            }
        });
        res.json(articles);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/public/articles/:slug", async (req, res) => {
    try {
        const article = await prisma.seoPage.findFirst({
            where: {
                slug: req.params.slug,
                published: true
            }
        });
        if (!article) return res.status(404).json({ error: "Article not found" });
        res.json(article);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});
`;

const target = 'res.json(sanitized);\n});';
if (content.includes(target)) {
   content = content.replace(target, target + '\n' + injection);
   fs.writeFileSync(path, content);
   console.log("Success");
} else {
   console.log("Target not found");
}
