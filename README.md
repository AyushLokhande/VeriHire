# Multi-Agent AI Interview Panel

Hackathon-ready Next.js prototype for the Prompt Wars challenge.

## Current development mode

`DEMO_MODE=true` makes **zero Gemini API requests**. The Run Interview Panel button returns the supplied Rohan/Ananya test-case results locally, so you can build and rehearse the UI without hitting the Gemini free-tier quota.

## Setup

1. Copy `.env.local.example` to `.env.local`.
2. Keep `DEMO_MODE=true` while working on the UI.
3. Run:
   `npm install`
4. Run:
   `npm run dev`
5. Open `http://localhost:3000`.
6. Click `Load official demo data`, then `Run Interview Panel`.

## Real mode

When you are ready to test the actual Gemini pipeline, set:

`DEMO_MODE=false`

and provide a valid `GEMINI_API_KEY`.

The real route uses separate independent agent calls before the debate stage. Expect substantially more API requests than demo mode.

Never commit `.env.local` or share your API key.
