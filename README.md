# Garden of Kindness

Garden of Kindness is a web app where people plant short kindness messages as flowers in a shared digital garden.

Each planted message creates:
- a public flower visible in the garden
- a private encrypted message accessible only through a secure tokenized link

## What This Project Does

- Shows a public, animated flower garden
- Lets users plant a flower with:
  - sender name
  - recipient name
  - kindness message
- Encrypts message content at rest in Supabase/Postgres
- Generates a secure share link for private message viewing
- Supports AI-generated message inspiration via Gemini (optional)

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Supabase (Postgres + RPC functions)
- Security: `pgcrypto` encryption (`content_encrypted`) + hashed access tokens

## Security Model

- Public flower metadata is readable (`flowers` table)
- Private message content is encrypted in `messages.content_encrypted`
- Tokens are stored as hashes (`access_token_hash`)
- Message retrieval uses token-based capability access (`get_message_by_token`)
- Planting has rate limiting in SQL (sender-name based, 15-minute window)

## Database Setup

1. Create a Supabase project
2. Open Supabase SQL Editor
3. Run:
   - `supabase/schema.sql`

This creates and/or migrates:
- `flowers` table (public visual data)
- `messages` table (encrypted private data)
- RPC functions:
  - `plant_message`
  - `get_message_by_token`

## Local Setup

1. Install dependencies:
   - `npm install`
2. Create/update `.env.local`:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

`GEMINI_API_KEY` is optional. Without it, the app uses a fallback suggestion message.

3. Start development server:
   - `npm run dev`

4. Build for production:
   - `npm run build`

## App Routes

- `/` -> Garden view + planting modal
- `#/view/:token` -> Private message view by secure token
- `#/donate` -> Placeholder/under-construction page

## Project Structure

- `components/` -> UI screens and reusable components
- `services/api.ts` -> Supabase and AI service layer
- `supabase/schema.sql` -> database schema + migrations + RPCs
- `types.ts` -> shared TypeScript types

## Notes

- If you change `supabase/schema.sql`, re-run it in Supabase SQL Editor.
- This repository currently does not include a separate backend server; Supabase functions as backend.
