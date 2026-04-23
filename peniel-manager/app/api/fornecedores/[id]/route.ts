import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/fornecedores/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const data = await req.json()

  const fornecedor = await prisma.fornecedor.update({
    where: { id },
    data: {
      nome: data.nome,
      cpfCnpj: data.cpfCnpj || null,
      email: data.email || null,
      telefone: data.telefone || null,
    },
  })

  return NextResponse.json(fornecedor)
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/fornecedores/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const data = await req.json()

  const fornecedor = await prisma.fornecedor.update({
    where: { id },
    data: { ativo: data.ativo },
  })

  return NextResponse.json(fornecedor)
}
