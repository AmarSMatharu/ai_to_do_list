# AI To-Do

AI-powered to-do app built with Next.js, Prisma, and the Claude API. Type tasks in plain English and Claude automatically parses priorities, due dates, and suggests follow-up tasks.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)
![Claude](https://img.shields.io/badge/Claude-Anthropic-orange?style=flat-square)

---

## Features

- **Natural language input** — type tasks the way you think, e.g. *"Call the client about the proposal by Friday, very urgent"*
- **Auto-prioritization** — Claude scores every task 1–10 and labels it P1 / P2 / P3
- **Due date extraction** — dates and times mentioned in plain English are parsed automatically
- **AI suggestions** — Claude generates 2–3 logical follow-up tasks for each entry
- **Clean UI** — Todoist-inspired interface with a sidebar, inline task form, and completed task tracking

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL (hosted on Neon) |
| ORM | Prisma 6 |
| AI | Anthropic Claude API (`claude-sonnet`) |
| Language | TypeScript |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- An [Anthropic API key](https://console.anthropic.com)
- A free PostgreSQL database from [Neon](https://neon.tech)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/AmarSMatharu/ai-todo.git
cd ai-todo
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root of the project:

```env
DATABASE_URL=postgresql://username:password@your-host.neon.tech/neondb?sslmode=require
ANTHROPIC_API_KEY=your_api_key_here
```

4. **Push the database schema**

```bash
npx prisma db push
npx prisma generate
```

5. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

When a user submits a task, the app sends the raw input to Claude with a structured prompt asking it to return JSON containing:

- A cleaned-up task description
- A priority score (1–10)
- A due date in ISO format (or null)
- 2–3 suggested follow-up tasks

```
Input:  "Email the client about the proposal by end of week, very urgent"

Output: {
  content: "Email client about the proposal",
  priority: 9,
  dueDate: "2024-12-20T17:00:00.000Z",
  suggestions: [
    "Prepare proposal summary doc",
    "Follow up if no reply by Monday",
    "Schedule a call to discuss feedback"
  ]
}
```

The parsed task is saved to PostgreSQL via Prisma and returned to the frontend instantly.

---

## Project Structure

```
ai-todo/
├── app/
│   ├── api/
│   │   └── tasks/
│   │       ├── route.ts          # GET all tasks, POST new task (with Claude)
│   │       └── [id]/route.ts     # PATCH (toggle complete), DELETE
│   ├── page.tsx                  # Main UI
│   └── layout.tsx
├── lib/
│   └── prisma.ts                 # Prisma client singleton
├── types/
│   └── task.ts                   # TypeScript interfaces
├── prisma/
│   └── schema.prisma             # Database schema
└── .env                          # Environment variables (not committed)
```
