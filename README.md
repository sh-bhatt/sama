# Sama

Sama is a premium social event discovery, invitation, RSVP, and memories platform for modern India. Guests can discover public gatherings and see organizer profiles, while hosts can create polished invite pages, collect RSVPs, manage guests, post updates, run date polls, check people in, share QR codes, export calendar files, and open a live photo-dump style memories album after the event.

Live demo: _coming soon_

## Features

- Clerk-powered host authentication
- Database-backed public Discover page
- Public organizer profiles with social/trust details
- Real event creation and host dashboard stats
- Dynamic public invite pages
- Public/private event visibility
- Anonymous and signed-in Interested flow
- Persistent RSVP flow with guest notes and plus-one support
- Guest approval, waitlist, custom RSVP questions, and RSVP answers
- Guest management with check-in and payment status controls
- Activity feed for RSVPs, polls, memories, and host updates
- Date polls with public voting
- Host broadcasts / guest updates
- Custom event info blocks
- QR codes for invite links and protected check-in
- Google Calendar links and `.ics` export
- Cloudinary-backed public memory/photo uploads
- Ably realtime refresh for invites, dashboards, polls, check-ins, and memories
- Dark/light theme with hydration-safe toggle
- Responsive, premium event UI built with Tailwind CSS v4

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript strict
- Tailwind CSS v4
- Clerk Auth
- Neon PostgreSQL
- Prisma
- Zod
- Ably
- Cloudinary
- QRCode

## Routes Overview

- `/` - public discovery/landing experience
- `/discover` - database-backed public event discovery with filters
- `/sign-in` and `/sign-up` - Clerk auth pages
- `/dashboard` - protected host dashboard
- `/dashboard/profile` - protected organizer profile settings
- `/dashboard/events/new` - protected event creation
- `/dashboard/events/[id]` - protected event management
- `/dashboard/events/[id]/check-in` - protected check-in console
- `/dashboard/events/[id]/date-poll` - protected date poll management
- `/dashboard/events/[id]/info-blocks` - protected event info management
- `/dashboard/events/[id]/questions` - protected custom RSVP question management
- `/dashboard/events/[id]/broadcasts` - protected host broadcast management
- `/invite/[slug]` - public invite, RSVP, poll, and memory teaser
- `/invite/[slug]/memories` - public event memories album and upload form
- `/u/[username]` - public organizer profile
- `/invite/demo` and `/invite/demo/memories` - static demo pages
- `/api/events/[id]/calendar` - public `.ics` calendar export
- `/api/realtime/token` - Ably token endpoint

## Environment Variables

Create `.env` from `.env.example` and fill in real values locally or in Vercel.

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

ABLY_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Use a Neon pooled `DATABASE_URL` for app runtime, for example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST-POOLER/DB?sslmode=require&connection_limit=5&pool_timeout=20"
```

Local dev servers, Prisma Studio, and stuck Node processes can hold Neon pool connections. On Windows, close extra terminals and Prisma Studio tabs first; if a Prisma engine DLL or connection pool stays locked, `taskkill /F /IM node.exe` can clear local Node processes before retrying `npx prisma generate` or `npm run build`.

`DIRECT_URL` is not currently required by this schema. If you later add `directUrl = env("DIRECT_URL")` to `prisma/schema.prisma`, set `DIRECT_URL` to the direct Neon connection string for migrations/db push while keeping `DATABASE_URL` as the pooled runtime URL.

## Local Setup

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open `http://localhost:3000`.

## Prisma Commands

```bash
npx prisma generate
npx prisma db push
```

Run `npx prisma db push` after schema changes, including organizer profile, Discover interest, broadcast, and memory photo fields.

## Quality Checks

```bash
npm run lint
npm run build
```

The build script runs `prisma generate` before `next build` so deployments have a fresh Prisma Client.

## Deployment Notes

- Deploy on Vercel with the same environment variables listed above.
- Set `DATABASE_URL` to the Neon pooled connection string.
- Set `ABLY_API_KEY` for realtime refresh. If omitted, core database flows still work without realtime indicators.
- Set Cloudinary credentials for memory uploads. If omitted, existing galleries render but uploads are paused with a friendly message.
- Do not expose `CLERK_SECRET_KEY`, `ABLY_API_KEY`, `CLOUDINARY_API_KEY`, or `CLOUDINARY_API_SECRET` to the client.

## Known Limitations

- Public memory uploads are allowed for event albums; hosts can delete photos, but advanced moderation workflows are not built yet.
- Payments are represented as host-managed statuses only. No Razorpay or live payment collection is included.
- Realtime updates use refresh-on-message instead of granular client-side state patches.
- Demo pages are static and separate from the live database-backed event flows.

## Future Improvements

- Vercel production deployment and domain setup
- README screenshots and resume/project bullets
- Optional memory approval queue
- Optional invite analytics and sharing insights
