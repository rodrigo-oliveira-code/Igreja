import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const ativo = searchParams.get('ativo')

  const fornecedores = await prisma.fornecedor.findMany({
    where: { ...(ativo !== null && { ativo: ativo === 'true' }) },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(fornecedores)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const fornecedor = await prisma.fornecedor.create({
    data: {
      nome: data.nome,
      cpfCnpj: data.cpfCnpj || null,
      email: data.email || null,
      telefone: data.telefone || null,
    },
  })

  return NextResponse.json(fornecedor, { status: 201 })
}
