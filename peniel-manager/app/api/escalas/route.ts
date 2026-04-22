import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const eventoId = searchParams.get('eventoId')

  const escalas = await prisma.escala.findMany({
    where: {
      ...(eventoId && { eventoId }),
    },
    include: {
      evento: true,
      membro: true,
      departamento: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(escalas)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const escala = await prisma.escala.create({
    data: {
      eventoId: data.eventoId,
      membroId: data.membroId,
      departamentoId: data.departamentoId || null,
      funcao: data.funcao,
      confirmado: data.confirmado || false,
    },
    include: { membro: true, evento: true },
  })

  return NextResponse.json(escala, { status: 201 })
}
