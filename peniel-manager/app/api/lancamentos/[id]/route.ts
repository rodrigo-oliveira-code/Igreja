import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/lancamentos/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params

  const lancamento = await prisma.lancamento.findUnique({
    where: { id },
    include: {
      contaPlano: true,
      departamento: true,
      contaBancaria: true,
      fornecedor: true,
      membro: { select: { id: true, nome: true } },
      criadoPor: { select: { id: true, nome: true } },
      aprovacoes: { include: { aprovador: { select: { id: true, nome: true } } } },
    },
  })

  if (!lancamento) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(lancamento)
}

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/lancamentos/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const data = await req.json()

  const lancamento = await prisma.lancamento.update({
    where: { id },
    data: {
      tipo: data.tipo,
      categoria: data.categoria || null,
      valor: data.valor,
      descricao: data.descricao || null,
      data: new Date(data.data),
      contaPlanoId: data.contaPlanoId || null,
      departamentoId: data.departamentoId || null,
      contaBancariaId: data.contaBancariaId || null,
      fornecedorId: data.fornecedorId || null,
      formaPagamento: data.formaPagamento || null,
      membroId: data.membroId || null,
      status: data.status,
    },
    include: {
      contaPlano: { select: { id: true, codigo: true, nome: true } },
      departamento: { select: { id: true, nome: true } },
    },
  })

  return NextResponse.json(lancamento)
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/lancamentos/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const data = await req.json()
  const userId = (session.user as any).id

  if (data.acao) {
    // Fluxo de aprovação
    await prisma.aprovacaoLancamento.create({
      data: {
        lancamentoId: id,
        aprovadorId: userId,
        acao: data.acao,
        justificativa: data.justificativa || null,
      },
    })

    const statusMap: Record<string, string> = {
      APROVADO: 'APROVADO',
      REJEITADO: 'REJEITADO',
      DEVOLVIDO: 'RASCUNHO',
    }

    await prisma.lancamento.update({
      where: { id },
      data: { status: statusMap[data.acao] as any },
    })

    return NextResponse.json({ success: true })
  }

  const lancamento = await prisma.lancamento.update({
    where: { id },
    data: { status: data.status },
  })

  return NextResponse.json(lancamento)
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/lancamentos/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params

  await prisma.lancamento.update({ where: { id }, data: { ativo: false } })

  return NextResponse.json({ success: true })
}
