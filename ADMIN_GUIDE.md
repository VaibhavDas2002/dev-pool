# 🎓 Campus Reunion Poll — Administrator Guide

> **Target Audience:** Class Representative, Batch Coordinators, and System Administrators  
> **Platform:** Campus Reunion Poll — B.Tech Certificate Collection Planner  
> **Official Admin:** Vaibhav Das  

---

## 📌 Table of Contents
1. [Overview & Administrator Role](#1-overview--administrator-role)
2. [Admin Authentication & Access](#2-admin-authentication--access)
3. [Poll Management & Configuration](#3-poll-management--configuration)
4. [Date Option Management](#4-date-option-management)
5. [Tie-Breaking & Winner Finalization](#5-tie-breaking--winner-finalization)
6. [Group Chat Moderation](#6-group-chat-moderation)
7. [Certificate Day Coordination & Broadcasts](#7-certificate-day-coordination--broadcasts)
8. [Database & Security Audit](#8-database--security-audit)

---

## 1. Overview & Administrator Role

As the Administrator for the **Campus Reunion Poll**, you oversee the decision-making process for our B.Tech graduating batch to collectively visit the college campus and collect our degrees.

### Key Responsibilities
- Set and enforce polling deadlines.
- Configure selectable visit dates (strictly starting **November 25, 2026**).
- Enforce campus administrative constraints (such as disabling weekend dates when the Registrar's office is closed).
- Formally resolve ties with recorded justification notes if multiple dates receive equal top votes.
- Moderate the batch discussion board to maintain a friendly, spam-free environment.
- Finalize the official reunion date and broadcast collection checklists to classmates.

---

## 2. Admin Authentication & Access

Administrator access is secured and segregated from standard batchmate logins.

### 🔑 Administrator Credentials

| Field | Configuration | Notes |
| :--- | :--- | :--- |
| **Email Address** | `djvaibhav900@gmail.com` | Official admin login identifier |
| **Password** | `abcd@1234` | Case-sensitive password |
| **Class Rep Name** | `Vaibhav Das` | Displayed with **Admin** / **👑** badge |
| **Registered Mobile** | `6297977842` | Primary contact identifier |
| **Access URL** | `/` (Corner Button) or `/admin` | Direct access to admin panel |

### How to Log In as Admin
1. Open the homepage: [http://localhost:3000/](http://localhost:3000/) or your deployment URL.
2. Click the **Admin Login** button located at the **top-right corner of the page** (or click the **Admin** shield badge on the form card).
3. In the modal:
   - Enter Email: `djvaibhav900@gmail.com`
   - Enter Password: `abcd@1234`
4. Click **Log In to Admin Console**.
5. You will be redirected to the **Admin Control Center** (`/admin`).

> [!NOTE]
> Batchmates log in using only their name and mobile number. Only the Administrator has access to `/admin` and elevated control actions.

---

## 3. Poll Management & Configuration

From the Admin Dashboard (`/admin`), you can manage all global poll parameters.

### Poll Status Transitions
```
[ Draft ]  ──>  [ Open ]  ──>  [ Closed ]  ──>  [ Finalized ]
```

1. **Draft:** Poll is under preparation. Batchmates cannot cast votes.
2. **Open:** Polling is active. Batchmates can cast and modify their votes in real-time.
3. **Closed:** Voting deadline reached. No further votes or modifications allowed; votes remain visible.
4. **Finalized:** Official winning date declared with an official celebration banner.

### Setting Voting Deadline
- Configure the exact cutoff date and time (using `Asia/Kolkata` timezone).
- Once the deadline passes, the system automatically locks the ballot while preserving live results.

### Weekend Policy Toggle
- **Toggle: Disable Weekends (Sat/Sun)**
- When enabled, prevents adding or selecting Saturdays and Sundays, since college administrative desks and the examination branch remain closed on weekends.

---

## 4. Date Option Management

### Strict Business Rule: Earliest Date
> **Rule:** Every selectable date must be strictly after November 24, 2026.  
> **Earliest Permissible Date:** `2026-11-25`.

### Adding Date Options
1. Go to **Admin Control Center** (`/admin`) → **Manage Date Options**.
2. Select a date using the date picker (dates prior to `2026-11-25` are blocked).
3. Click **Add Date Option**.
4. The date is instantly added to the database and appears in all students' voting screens in real-time.

### Removing Date Options
- Click the **Remove (Trash)** icon next to an option.
- The system will ask for confirmation, safely clean up any associated votes, and create an auditable log entry.

---

## 5. Tie-Breaking & Winner Finalization

### Preventing Silent Earliest-Date Fallbacks
If two or more dates receive the exact same highest vote count, the system automatically flags an **Active Tie**:
- Turnout and leaderboard display `is_tie = true`.
- An amber alert warns classmates that a tie has occurred.
- **The system will never arbitrarily pick the earliest date.**

### How to Formally Resolve a Tie
1. In the **Admin Panel**, navigate to **Resolve Poll Tie**.
2. Select the preferred date from among the tied options.
3. Enter an **Auditable Justification Note** (e.g., *"Academic Cell confirmed full staff presence on 27 Nov"*).
4. Click **Resolve Tie & Finalize Date**.
5. The poll transitions to `finalized` and broadcasts the official date banner to all batchmates.

---

## 6. Group Chat Moderation

The discussion board (`/discussion`) allows classmates to coordinate travel and meetup plans.

### Moderation Tools
- **Deleting Inappropriate Messages:** As an admin, a red **Trash** icon appears on any message.
- **Soft Deletion:** Moderated messages are flagged with `is_deleted = true`, replacing the content with *"This message was removed by the administrator."*
- **Audit:** The administrator's user ID is recorded under `deleted_by` in PostgreSQL.

---

## 7. Certificate Day Coordination & Broadcasts

### Required Student Checklist
Remind all batchmates to bring the following essential items to the college counter:
1. **Student Identity Card** (or Government Photo ID: Aadhaar / Voter ID).
2. **Library & Laboratory No-Dues Clearance Slip**.
3. **Provisional Degree Certificate / Final Semester Grade Card** copy.
4. **4 Passport-size Photographs** (in formal attire for degree counter verification).
5. **Fee Clearance Receipt** for degree processing.

### One-Click WhatsApp Announcement Template
Use this template to broadcast the final date to your batch WhatsApp groups:

```text
🎓 *B.TECH BATCH REUNION & CERTIFICATE COLLECTION* 🎓

Hey Batch of 2026!
Our official visit date has been finalized through the reunion poll!

📅 *Official Reunion Date:* [Winning Date, e.g. Friday, 27 November 2026]
⏰ *Reporting Time:* 10:30 AM IST
📍 *Assembly Point:* Main Academic Building (Near Canteen)

✅ *Mandatory Documents to Bring:*
1. College ID / Government Photo ID
2. Library & Lab No-Dues Clearance slip
3. Final Semester Marksheet copy
4. 2-4 Passport Photographs

Let's meet up, collect our degrees, and celebrate together!
Check full results & schedule: https://dev-pool-sable.vercel.app/
```

---

## 8. Database & Security Audit

### Data Privacy Guarantee
- Batchmates' mobile numbers are **never exposed** in the public API or UI.
- The database view `public_profiles` explicitly projects only `id`, `full_name`, `role`, and `has_voted`.

### Diagnostic Commands
Run the diagnostic script at any time to verify system health:
```bash
# Run database and poll diagnostics
npx tsx scripts/test-supabase-db.ts

# Run complete automated test suite (43 tests)
npm test
```

---

*Authored by Antigravity for Campus Reunion Poll — Official Administrator Reference.*

