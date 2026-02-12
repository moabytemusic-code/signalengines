
# SequenceEngine™ Implementation Guide (Postgres Edition)

You have successfully added the **SequenceEngine™** module to SignalEngines Hub with **PostgreSQL persistence** (sharing the database with your other engines).

## Next Steps

1.  **Install dependencies**:
    ```bash
    cd apps/hub
    npm install
    ```
    (This ensures `prisma`, `@prisma/client`, and `openai` are installed)

2.  **Update Database Schema**:
    Table definitions (`UsageCounter`, `Sequence`) and fields (`User.tier`, `User.billingProvider`) have been added to `services/api/prisma/schema.prisma`.
    
    You need to apply these changes to your database:
    ```bash
    cd services/api
    npx prisma db push
    ```

3.  **Generate Prisma Client for Hub**:
    The Hub application needs to know about the new schema.
    ```bash
    cd apps/hub
    npx prisma generate --schema=../../services/api/prisma/schema.prisma
    ```

4.  **Set Environment Variables**:
    Add the following to `apps/hub/.env.local`:
    ```bash
    OPENAI_API_KEY=sk-...
    DATABASE_URL="postgresql://..." # Same connection string as services/api/.env
    BILLING_PROVIDER=gumroad
    # GUMROAD_WEBHOOK_SECRET=...
    ```

5.  **Verify Engine**:
    - Visit `/engines` to see "SequenceEngine™" listed.
    - Click "Open Engine" to use the tool at `/apps/sequence-engine`.
    - Check usage limits (Free vs Pro). Note: Authentication relies on the `signal_session` cookie set by your main auth flow.

6.  **Marketing Hookup**:
    - Use content from `MARKETING_COPY.md` for your landing page.
    - Configure Gumroad webhook to point to `/api/webhooks/gumroad`.

## Architecture Overview
- **Engine Logic**: `src/engines/sequence-engine/`
- **Shared logic**: `src/engines/base/` (usage, guards - now powered by Prisma)
- **Billing**: `src/billing/` (Gumroad abstraction)
- **API**: `src/app/api/engines/sequence-engine/generate/route.ts`
- **Database**: Shared Postgres via Prisma.
