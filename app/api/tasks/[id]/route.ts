import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH - toggle complete or update
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const task = await prisma.task.update({
    where: { id: params.id },
    data: body
  })
  return NextResponse.json(task)
}

// DELETE a task
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.task.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}