import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const departamentoId = searchParams.get('departamentoId') || ''

  const membros = await prisma.membro.findMany({
    where: {
      ...(search && {
        OR: [
          { nome: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status: status as any }),
      ...(departamentoId && {
        departamentos: { some: { departamentoId } },
      }),
    },
    include: {
      departamentos: { include: { departamento: true } },
    },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(membros)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const membro = await prisma.membro.create({
    data: {
      nome: data.nome,
      email: data.email || null,
      telefone: data.telefone || null,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
      dataIngresso: data.dataIngresso ? new Date(data.dataIngresso) : null,
      status: data.status || 'ATIVO',
      endereco: data.endereco || null,
      observacoes: data.observacoes || null,
    },
  })

  return NextResponse.json(membro, { status: 201 })
}
