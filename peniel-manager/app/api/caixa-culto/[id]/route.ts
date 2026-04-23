import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/caixa-culto/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params

  const sessao = await prisma.cultoSessao.findUnique({
    where: { id },
    include: {
      responsavel: { select: { id: true, nome: true } },
      lancamentos: {
        where: { ativo: true },
        include: {
          contaPlano: { select: { nome: true, codigo: true } },
          membro: { select: { nome: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!sessao) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(sessao)
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/caixa-culto/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const data = await req.json()

  const updateData: any = {}

  if (data.status === 'FECHADO') {
    const sessao = await prisma.cultoSessao.findUnique({
      where: { id },
      include: { lancamentos: { where: { ativo: true } } },
    })
    const totalLancado = sessao?.lancamentos.reduce((s, l) => s + Number(l.valor), 0) || 0
    const totalContagemFisica = Number(data.totalContagemFisica) || 0
    updateData.status = 'FECHADO'
    updateData.fechadoEm = new Date()
    updateData.totalLancado = totalLancado
    updateData.totalContagemFisica = totalContagemFisica
    updateData.divergencia = totalContagemFisica - totalLancado
  } else {
    if (data.saldoInicial !== undefined) updateData.saldoInicial = data.saldoInicial
    if (data.tipoCulto !== undefined) updateData.tipoCulto = data.tipoCulto
  }

  const sessao = await prisma.cultoSessao.update({
    where: { id },
    data: updateData,
    include: { responsavel: { select: { id: true, nome: true } } },
  })

  return NextResponse.json(sessao)
}
