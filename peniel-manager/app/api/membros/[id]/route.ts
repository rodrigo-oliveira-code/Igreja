import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membro = await prisma.membro.findUnique({
    where: { id: params.id },
    include: {
      departamentos: { include: { departamento: true } },
      escalas: {
        include: { evento: true, departamento: true },
        orderBy: { evento: { data: 'desc' } },
        take: 20,
      },
    },
  })

  if (!membro) return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 })
  return NextResponse.json(membro)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const membro = await prisma.membro.update({
    where: { id: params.id },
    data: {
      nome: data.nome,
      email: data.email || null,
      telefone: data.telefone || null,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
      dataIngresso: data.dataIngresso ? new Date(data.dataIngresso) : null,
      status: data.status,
      endereco: data.endereco || null,
      observacoes: data.observacoes || null,
    },
  })

  return NextResponse.json(membro)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.membro.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
