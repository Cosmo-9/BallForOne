# BallForOne

Your own ball-sport tournament ecosystem: organize departmental and inter-faculty competitions.

**Built so far:**
- Step 1, Foundation: organizer sign-in, create tournaments, add teams and players. Anyone can view; only signed-in organizers can change things.
- Step 2, Fixtures: one click generates a full league schedule (round-robin) or a random knockout draw, with byes for odd numbers. Organizers can set each match's date and venue.

**Coming next:** results and standings, brackets, live scores, player stats, MVP voting, digital player cards.

## Stack

- [Next.js](https://nextjs.org) (App Router) with Tailwind CSS
- [Neon](https://neon.tech) Postgres, via [Drizzle ORM](https://orm.drizzle.team)
- Deployed on [Vercel](https://vercel.com)

## Setup

1. **Create the tables.** In the Neon dashboard, open the SQL Editor, paste in [`db/setup.sql`](db/setup.sql) and run it. If you set up the database before a later step was added, run just that step's file from [`db/updates/`](db/updates) instead.
2. **Add environment variables** in Vercel (Project → Settings → Environment Variables), or in `.env.local` when running locally. See [`.env.example`](.env.example):
   - `DATABASE_URL`: your Neon connection string
   - `ADMIN_PASSWORD`: the password organizers sign in with
   - `AUTH_SECRET`: any long random string
3. **Deploy.** Every push to `main` redeploys on Vercel.

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

## Project layout

```
src/
  app/                  pages and server actions
    actions.ts          everything that changes data
    tournaments/[id]/   a tournament, its teams, and each team's squad
  db/schema.ts          database tables (keep in sync with db/setup.sql)
  lib/auth.ts           organizer sign-in
  lib/options.ts        sports and tournament formats
```
