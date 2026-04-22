import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { membroId, funcao } = await req.json()

  const membroDepto = await prisma.membroDepto.upsert({
    where: { membroId_departamentoId: { membroId, departamentoId: params.id } },
    update: { funcao },
    create: { membroId, departamentoId: params.id, funcao },
  })

  return NextResponse.json(membroDepto, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { membroId } = await req.json()

  await prisma.membroDepto.delete({
    where: { membroId_departamentoId: { membroId, departamentoId: params.id } },
  })

  return NextResponse.json({ success: true })
}
