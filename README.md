# 🎓 Campus Reunion Poll — B.Tech Certificate Collection Planner

> A production-ready web application designed for B.Tech batchmates to collectively decide on an official date after **November 24, 2026** to visit college, collect graduation certificates from the Academic Section, and celebrate together!

---

## 🌟 Key Features

1. **Lightweight & Secure Onboarding:**
   - Full Name + 10-digit Indian Mobile number (`^[6-9]\d{9}$`).
   - Dual-mode authentication:
     - **Private Invite / Demo Mode:** Server-issued, signed `HttpOnly` JWT cookie session (no password hassles, fast testing).
     - **Production SMS OTP Mode:** Full integration with Supabase Phone Auth (Twilio / MessageBird / MSG91).
   - Strict privacy: **Mobile numbers are never exposed** in public profiles or chat payloads.

2. **Core Polling & Business Rules:**
   - **Date Constraint:** Only allows dates **after November 24, 2026** (earliest selectable date: `November 25, 2026`).
   - **Timezone:** Standardized on `Asia/Kolkata` for all deadlines and schedules.
   - **Atomic Single-Vote Guarantee:** Each member casts exactly 1 active vote per poll.
   - **Vote Updates:** Friends can change their vote anytime before the voting deadline. Updates replace the previous selection atomically without creating duplicates.
   - **Democracy & Tie Handling:** The date with the highest votes wins. If a tie occurs between top dates, a clear **Tie Status** is displayed; ties cannot be resolved silently by date order, requiring an explicit admin decision or runoff poll with an auditable rationale note.
   - **Official Finalization:** Once closed/finalized by the Class Rep, a prominent celebration announcement is declared: `🎉 It's Official! We're Meeting on 27 November 2026!`.

3. **Live Results & Realtime Sync:**
   - Real-time vote tallies, turnout percentages, and horizontal progress bars.
   - Visual distinction between "Current Leader" and "Confirmed Official Date".
   - Total registered classmates, total votes, and remaining pending votes.

4. **Group Discussion Chat ("College Reunion Discussion"):**
   - Real-time discussion room with sender names, role badges (Admin vs Member), and timestamps.
   - Grouping of consecutive messages from the same sender.
   - Quick one-click graduation emojis (`🎓`, `🍜`, `📜`, `🎉`, `❤️`, `👍`).
   - Self-message deletion + Admin moderation controls.
   - Sanitized message input (up to 500 characters, XSS-proof).

5. **Class Rep / Admin Command Center:**
   - Manage date options (add dates on or after Nov 25, 2026, remove dates with vote audit log).
   - Configure voting deadline and toggle poll status (`draft`, `open`, `closed`, `finalized`).
   - Resolve ties with justification rationale.
   - Realtime chat moderation.

---

## 🚀 Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + Custom Design System
- **Icons:** [Lucide React](https://lucide.dev/)
- **Validation:** [Zod](https://zod.dev/)
- **Dates & Timezone:** [date-fns](https://date-fns.org/) (`Asia/Kolkata`)
- **Database & Realtime:** [Supabase PostgreSQL](https://supabase.com/) (RLS, Stored Procedures, Realtime channels)
- **Sessions & Crypto:** [jose](https://github.com/panva/jose) (HMAC SHA-256 JWT cookies)
- **Notifications & FX:** [Sonner](https://sonner.emilkowal.ski/) & [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Testing:** [Vitest](https://vitest.dev/)

---

## 📁 Project Structure

```text
campus-reunion-poll/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing / Join page
│   │   ├── dashboard/                  # Main Reunion Dashboard
│   │   ├── vote/                       # Dedicated Voting & Calendar page
│   │   ├── results/                    # Real-time Voting Standings
│   │   ├── discussion/                 # Group Chat page
│   │   ├── members/                    # Registered batchmates directory
│   │   ├── admin/                      # Admin Command Center
│   │   ├── api/                        # Next.js Server Route Handlers
│   │   │   ├── auth/                   # Login, Me, Logout
│   │   │   ├── poll/                   # Vote, Results, Options
│   │   │   ├── chat/                   # Send, Delete, Moderate
│   │   │   ├── admin/                  # Config, Tie Break, Finalize
│   │   │   └── members/                # Privacy-safe Public Directory
│   │   ├── globals.css                 # Tailwind design variables
│   │   └── layout.tsx                  # Global navigation and toast provider
│   ├── components/
│   │   ├── ui/                         # Accessible UI primitives (Button, Card, Badge, etc.)
│   │   ├── layout/                     # Navbar, Footer, DemoModeBanner
│   │   ├── dashboard/                  # Hero, StatCards, WinnerBanner, Memories
│   │   ├── polling/                    # DateOptionCard, TieBreakAlert, ProgressBars
│   │   └── chat/                       # ChatBox, MessageBubble, EmojiBar
│   ├── lib/
│   │   ├── constants/                  # Default IDs, dates, and cookies
│   │   ├── session.ts                  # Secure HttpOnly session handling
│   │   ├── data-service.ts             # Clean architecture data access layer
│   │   ├── validations/                # Zod validation schemas
│   │   ├── utils/                      # Kolkata timezone helpers & initials
│   │   └── supabase/                   # Supabase client, server & mock store
│   └── types/                          # Complete TypeScript interfaces
├── supabase/
│   ├── migrations/                     # PostgreSQL DDL, Views, Stored Functions & RLS
│   └── seed.sql                        # Initial poll, dates, classmates & sample chat
├── tests/                              # Automated Vitest test suite
├── .env.example                        # Environment variables template
├── package.json
└── README.md
```

---

## 🛠️ Local Development

### 1. Prerequisites
- **Node.js** (v18 or higher; tested on v22 & v26)
- **npm** (v9 or higher)

### 2. Clone and Install
```bash
# Clone the repository
git clone <repo-url>
cd campus-reunion-poll

# Install dependencies
npm install
```

### 3. Environment Variables
Copy the template to create your `.env.local`:
```bash
cp .env.example .env.local
```

> **Note on Zero-Friction Local Testing:**
> The application includes an in-memory mock data store pre-seeded with 15 classmates and active sample votes. You can run `npm run dev` and test immediately without configuring Supabase! When you plug in your Supabase credentials, the app automatically connects to live Supabase Postgres.

### 4. Run the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run the Automated Tests
```bash
npm test
```
All 20 unit and integration tests will run with Vitest.

---

## 🗄️ Supabase Cloud Setup

### 1. Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **API Keys** (`anon` public key and `service_role` secret key).

### 2. Run Database Migrations
1. In your Supabase Dashboard, navigate to the **SQL Editor**.
2. Open `supabase/migrations/20261109000000_init_campus_reunion_poll.sql`.
3. Paste the contents into the SQL Editor and click **Run**.
4. (Optional) Run `supabase/seed.sql` to populate sample classmates, the default certificate poll, and test chat messages.

### 3. Enable Supabase Realtime
Ensure Realtime replication is enabled for:
- `chat_messages`
- `votes`
- `polls`
- `poll_options`

*(The migration SQL script automatically configures `ALTER PUBLICATION supabase_realtime ADD TABLE ...`)*.

### 4. Row Level Security (RLS)
The following policies are active:
- `profiles`: All authenticated users can view public safe columns (`id`, `full_name`, `role`). Mobile numbers are restricted.
- `votes`: Members can read only their own votes. Aggregates are computed via the secure stored procedure `get_poll_results`.
- `chat_messages`: Members can read active messages; users can soft-delete only their own messages (`user_id = actor_id`); admins can moderate any message.
- `cast_or_update_vote`: Stored procedure running with `SECURITY DEFINER` guarantees atomic execution and prevents duplicate active votes.

---

## 📱 Configuring SMS OTP (Production)

To enable 6-digit SMS OTP via Supabase:
1. Go to **Authentication -> Providers -> Phone** in the Supabase Dashboard.
2. Turn on **Enable Phone Provider**.
3. Choose your SMS gateway (Twilio, MessageBird, or AWS SNS) and enter your API credentials.
4. In `.env.local`, set:
   ```env
   NEXT_PUBLIC_ENABLE_SMS_OTP=true
   ```

---

## ☁️ Vercel Deployment

1. Push your code to GitHub / GitLab.
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your repository.
4. Add the following Environment Variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`
   - `INITIAL_ADMIN_MOBILE` (e.g., `9876543210`)
   - `NEXT_PUBLIC_APP_URL`
5. Click **Deploy**.

---

## 🛡️ Important Security Principles Implemented

- **No Public Phone Numbers:** Mobile numbers are strictly private. The `/members` directory and chat payloads only surface display names, roles, and avatar initials.
- **Service Role Isolation:** `SUPABASE_SERVICE_ROLE_KEY` is never referenced in client components or sent to browser bundles.
- **Session Tokens:** Server-signed JWTs (`jose`) with `HttpOnly`, `SameSite=Lax`, and `Secure` attributes prevent XSS session theft.
- **Input Sanitization:** Every string is validated using Zod, disallowing script tags and enforcing strict character limits.
- **Atomic Voting:** Voting mutations happen through an ACID PostgreSQL transaction, preventing double-voting even under concurrent clicks.

---

## 🎓 Class Representatives & Demo Credentials

| Role | Name | Mobile Number | Password / Access | Description |
|---|---|---|---|---|
| **Class Rep (Admin)** | **Vaibhav Das** | `6297977842` | `abcd@1234` | Full administrative control, date management, tie resolution, moderation |
| **Batchmate (Member)** | Priya Sharma | `9876543211` | *None required* | Regular classmate voting and discussion |
| **Batchmate (Member)** | Rohan Gupta | `9876543212` | *None required* | Regular classmate voting and discussion |

---

*Made with ❤️ for our B.Tech College Graduation Reunion.*
