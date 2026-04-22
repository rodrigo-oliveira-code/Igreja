import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const departamentos = await prisma.departamento.findMany({
    include: {
      membros: { include: { membro: true } },
    },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(departamentos)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const departamento = await prisma.departamento.create({
    data: {
      nome: data.nome,
      descricao: data.descricao || null,
      cor: data.cor || '#7C3AED',
      liderId: data.liderId || null,
    },
  })

  return NextResponse.json(departamento, { status: 201 })
}
