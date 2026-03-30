import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// GET all tasks
export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ completed: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }]
  })
  return NextResponse.json(tasks)
}

// POST a new task (with Claude parsing)
export async function POST(req: Request) {
  const { input } = await req.json()

  // Ask Claude to parse the natural language input
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `You are a task parser. Parse this task input and return ONLY valid JSON, no markdown, no explanation.

Input: "${input}"

Return this exact JSON structure:
{
  "content": "cleaned up task description",
  "priority": 7,
  "dueDate": "2024-12-25T17:00:00.000Z or null",
  "suggestions": ["related task 1", "related task 2"]
}

Rules:
- priority is 1-10 (10 = most urgent)
- dueDate must be a valid ISO 8601 string or null
- suggestions should be 2-3 logical follow-up tasks
- content should be a clean, actionable task description
- Today's date is ${new Date().toISOString()}`
    }]
  })

  let parsed
  try {
    parsed = JSON.parse(message.content[0].type === 'text' ? message.content[0].text : '{}')
  } catch {
    parsed = { content: input, priority: 5, dueDate: null, suggestions: [] }
  }

  const task = await prisma.task.create({
    data: {
      content: parsed.content || input,
      priority: parsed.priority || 5,
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      suggestions: parsed.suggestions || [],
    }
  })

  return NextResponse.json(task)
}