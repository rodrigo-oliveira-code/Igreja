import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed...')

  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@peniel.com' },
    update: {},
    create: {
      email: 'admin@peniel.com',
      password: hashedPassword,
      nome: 'Administrador',
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Usuário admin criado:', admin.email)

  const tesoureiro = await prisma.user.upsert({
    where: { email: 'tesoureiro@peniel.com' },
    update: {},
    create: {
      email: 'tesoureiro@peniel.com',
      password: hashedPassword,
      nome: 'João Tesoureiro',
      role: 'TESOUREIRO',
    },
  })
  console.log('✅ Tesoureiro criado:', tesoureiro.email)

  // Departamentos
  const depts = await Promise.all([
    prisma.departamento.upsert({
      where: { nome: 'Louvor' },
      update: {},
      create: { nome: 'Louvor', descricao: 'Ministério de louvor e adoração', cor: '#7C3AED' },
    }),
    prisma.departamento.upsert({
      where: { nome: 'Sonoplastia' },
      update: {},
      create: { nome: 'Sonoplastia', descricao: 'Equipe de som e multimídia', cor: '#2563EB' },
    }),
    prisma.departamento.upsert({
      where: { nome: 'Recepção' },
      update: {},
      create: { nome: 'Recepção', descricao: 'Equipe de recepção e acolhimento', cor: '#16A34A' },
    }),
    prisma.departamento.upsert({
      where: { nome: 'Infantil' },
      update: {},
      create: { nome: 'Infantil', descricao: 'Ministério infantil', cor: '#EA580C' },
    }),
    prisma.departamento.upsert({
      where: { nome: 'Intercessão' },
      update: {},
      create: { nome: 'Intercessão', descricao: 'Equipe de oração e intercessão', cor: '#DB2777' },
    }),
  ])
  console.log('✅ Departamentos criados:', depts.length)

  // Membros
  const membrosData = [
    { nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 98765-4321', status: 'ATIVO', dataNascimento: new Date('1990-03-15'), dataIngresso: new Date('2018-01-10') },
    { nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 91234-5678', status: 'ATIVO', dataNascimento: new Date('1985-07-22'), dataIngresso: new Date('2017-06-01') },
    { nome: 'Pedro Oliveira', email: 'pedro@email.com', telefone: '(11) 99876-5432', status: 'ATIVO', dataNascimento: new Date('1995-11-08'), dataIngresso: new Date('2020-03-15') },
    { nome: 'Ana Lima', email: 'ana@email.com', telefone: '(11) 92345-6789', status: 'ATIVO', dataNascimento: new Date('1992-04-18'), dataIngresso: new Date('2019-09-01') },
    { nome: 'Carlos Ferreira', email: 'carlos@email.com', telefone: '(11) 93456-7890', status: 'ATIVO', dataNascimento: new Date('1988-12-30'), dataIngresso: new Date('2016-02-20') },
    { nome: 'Beatriz Costa', email: 'beatriz@email.com', telefone: '(11) 94567-8901', status: 'ATIVO', dataNascimento: new Date('1998-08-05'), dataIngresso: new Date('2021-01-15') },
    { nome: 'Roberto Souza', email: 'roberto@email.com', status: 'INATIVO', dataNascimento: new Date('1975-02-14'), dataIngresso: new Date('2015-05-10') },
    { nome: 'Fernanda Alves', email: 'fernanda@email.com', telefone: '(11) 95678-9012', status: 'ATIVO', dataNascimento: new Date('1993-06-25'), dataIngresso: new Date('2020-08-01') },
    { nome: 'Lucas Pereira', status: 'VISITANTE', dataNascimento: new Date('2000-01-10') },
    { nome: 'Juliana Rodrigues', email: 'juliana@email.com', telefone: '(11) 96789-0123', status: 'ATIVO', dataNascimento: new Date('1991-09-12'), dataIngresso: new Date('2018-11-05') },
  ]

  const membros = []
  for (const data of membrosData) {
    const m = await prisma.membro.upsert({
      where: { email: data.email || `noemail_${data.nome.replace(/\s/g, '')}@placeholder.com` },
      update: {},
      create: data as any,
    })
    membros.push(m)
  }
  console.log('✅ Membros criados:', membros.length)

  await prisma.membroDepto.createMany({
    skipDuplicates: true,
    data: [
      { membroId: membros[0].id, departamentoId: depts[0].id, funcao: 'Vocal' },
      { membroId: membros[1].id, departamentoId: depts[0].id, funcao: 'Teclado' },
      { membroId: membros[2].id, departamentoId: depts[1].id, funcao: 'Operador' },
      { membroId: membros[3].id, departamentoId: depts[2].id, funcao: 'Recepcionista' },
      { membroId: membros[4].id, departamentoId: depts[2].id, funcao: 'Coordenador' },
      { membroId: membros[5].id, departamentoId: depts[3].id, funcao: 'Professora' },
      { membroId: membros[7].id, departamentoId: depts[4].id, funcao: 'Intercessora' },
      { membroId: membros[9].id, departamentoId: depts[0].id, funcao: 'Guitarra' },
    ],
  })
  console.log('✅ Membros associados a departamentos')

  // Eventos
  const hoje = new Date()
  const eventosData = [
    { titulo: 'Culto Dominical', data: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 3), horaInicio: '10:00', horaFim: '12:00', tipo: 'CULTO', local: 'Templo Principal' },
    { titulo: 'Culto de Quarta', data: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 5), horaInicio: '19:30', horaFim: '21:00', tipo: 'CULTO', local: 'Templo Principal' },
    { titulo: 'Ensaio do Louvor', data: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1), horaInicio: '19:00', horaFim: '21:00', tipo: 'ENSAIO', local: 'Sala do Louvor' },
    { titulo: 'Reunião de Líderes', data: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 7), horaInicio: '09:00', horaFim: '11:00', tipo: 'REUNIAO', local: 'Sala de Reuniões' },
    { titulo: 'Célula Zona Norte', data: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 4), horaInicio: '20:00', tipo: 'CELULA', local: 'Casa da Ana Lima' },
  ]

  const eventos = await Promise.all(
    eventosData.map((e) => prisma.evento.create({ data: e as any }))
  )
  console.log('✅ Eventos criados:', eventos.length)

  await prisma.escala.createMany({
    skipDuplicates: true,
    data: [
      { eventoId: eventos[0].id, membroId: membros[0].id, departamentoId: depts[0].id, funcao: 'Vocal', confirmado: true },
      { eventoId: eventos[0].id, membroId: membros[1].id, departamentoId: depts[0].id, funcao: 'Teclado', confirmado: true },
      { eventoId: eventos[0].id, membroId: membros[2].id, departamentoId: depts[1].id, funcao: 'Som', confirmado: false },
      { eventoId: eventos[0].id, membroId: membros[3].id, departamentoId: depts[2].id, funcao: 'Recepção', confirmado: true },
      { eventoId: eventos[1].id, membroId: membros[0].id, departamentoId: depts[0].id, funcao: 'Vocal', confirmado: false },
      { eventoId: eventos[1].id, membroId: membros[9].id, departamentoId: depts[0].id, funcao: 'Guitarra', confirmado: true },
      { eventoId: eventos[2].id, membroId: membros[0].id, departamentoId: depts[0].id, funcao: 'Regência', confirmado: true },
    ],
  })
  console.log('✅ Escalas criadas')

  // ─── PLANO DE CONTAS ──────────────────────────────────────
  const contaReceitas = await prisma.planoDeContas.upsert({
    where: { codigo: '1' },
    update: {},
    create: { codigo: '1', nome: 'RECEITAS', tipo: 'RECEITA' },
  })
  const contaDizimos = await prisma.planoDeContas.upsert({
    where: { codigo: '1.1' },
    update: {},
    create: { codigo: '1.1', nome: 'Dízimos', tipo: 'RECEITA', paiId: contaReceitas.id },
  })
  const contaDizimosMemb = await prisma.planoDeContas.upsert({
    where: { codigo: '1.1.1' },
    update: {},
    create: { codigo: '1.1.1', nome: 'Dízimos de Membros', tipo: 'RECEITA', paiId: contaDizimos.id },
  })
  await prisma.planoDeContas.upsert({
    where: { codigo: '1.1.2' },
    update: {},
    create: { codigo: '1.1.2', nome: 'Dízimos Online', tipo: 'RECEITA', paiId: contaDizimos.id },
  })
  const contaOfertas = await prisma.planoDeContas.upsert({
    where: { codigo: '1.2' },
    update: {},
    create: { codigo: '1.2', nome: 'Ofertas', tipo: 'RECEITA', paiId: contaReceitas.id },
  })
  const contaOfertasCulto = await prisma.planoDeContas.upsert({
    where: { codigo: '1.2.1' },
    update: {},
    create: { codigo: '1.2.1', nome: 'Ofertas de Culto', tipo: 'RECEITA', paiId: contaOfertas.id },
  })
  await prisma.planoDeContas.upsert({
    where: { codigo: '1.2.2' },
    update: {},
    create: { codigo: '1.2.2', nome: 'Ofertas Especiais', tipo: 'RECEITA', paiId: contaOfertas.id },
  })
  await prisma.planoDeContas.upsert({
    where: { codigo: '1.3' },
    update: {},
    create: { codigo: '1.3', nome: 'Campanhas', tipo: 'RECEITA', paiId: contaReceitas.id },
  })
  await prisma.planoDeContas.upsert({
    where: { codigo: '1.4' },
    update: {},
    create: { codigo: '1.4', nome: 'Outras Receitas', tipo: 'RECEITA', paiId: contaReceitas.id },
  })

  const contaDespesas = await prisma.planoDeContas.upsert({
    where: { codigo: '2' },
    update: {},
    create: { codigo: '2', nome: 'DESPESAS', tipo: 'DESPESA' },
  })
  const contaPessoal = await prisma.planoDeContas.upsert({
    where: { codigo: '2.1' },
    update: {},
    create: { codigo: '2.1', nome: 'Pessoal', tipo: 'DESPESA', paiId: contaDespesas.id },
  })
  await prisma.planoDeContas.upsert({
    where: { codigo: '2.1.1' },
    update: {},
    create: { codigo: '2.1.1', nome: 'Salários', tipo: 'DESPESA', paiId: contaPessoal.id },
  })
  await prisma.planoDeContas.upsert({
    where: { codigo: '2.1.2' },
    update: {},
    create: { codigo: '2.1.2', nome: 'Pró-Labore', tipo: 'DESPESA', paiId: contaPessoal.id },
  })
  const contaInstalacoes = await prisma.planoDeContas.upsert({
    where: { codigo: '2.2' },
    update: {},
    create: { codigo: '2.2', nome: 'Instalações', tipo: 'DESPESA', paiId: contaDespesas.id },
  })
  const contaAluguel = await prisma.planoDeContas.upsert({
    where: { codigo: '2.2.1' },
    update: {},
    create: { codigo: '2.2.1', nome: 'Aluguel', tipo: 'DESPESA', paiId: contaInstalacoes.id },
  })
  const contaEnergia = await prisma.planoDeContas.upsert({
    where: { codigo: '2.2.2' },
    update: {},
    create: { codigo: '2.2.2', nome: 'Energia Elétrica', tipo: 'DESPESA', paiId: contaInstalacoes.id },
  })
  await prisma.planoDeContas.upsert({
    where: { codigo: '2.2.3' },
    update: {},
    create: { codigo: '2.2.3', nome: 'Água', tipo: 'DESPESA', paiId: contaInstalacoes.id },
  })
  await prisma.planoDeContas.upsert({
    where: { codigo: '2.2.4' },
    update: {},
    create: { codigo: '2.2.4', nome: 'Internet/Telefone', tipo: 'DESPESA', paiId: contaInstalacoes.id },
  })
  const contaMissoes = await prisma.planoDeContas.upsert({
    where: { codigo: '2.3' },
    update: {},
    create: { codigo: '2.3', nome: 'Missões', tipo: 'DESPESA', paiId: contaDespesas.id },
  })
  const contaMaterial = await prisma.planoDeContas.upsert({
    where: { codigo: '2.4' },
    update: {},
    create: { codigo: '2.4', nome: 'Material', tipo: 'DESPESA', paiId: contaDespesas.id },
  })
  const contaManutencao = await prisma.planoDeContas.upsert({
    where: { codigo: '2.5' },
    update: {},
    create: { codigo: '2.5', nome: 'Manutenção', tipo: 'DESPESA', paiId: contaDespesas.id },
  })
  await prisma.planoDeContas.upsert({
    where: { codigo: '2.6' },
    update: {},
    create: { codigo: '2.6', nome: 'Eventos', tipo: 'DESPESA', paiId: contaDespesas.id },
  })

  await prisma.planoDeContas.upsert({
    where: { codigo: '3' },
    update: {},
    create: { codigo: '3', nome: 'ATIVOS', tipo: 'ATIVO' },
  })
  await prisma.planoDeContas.upsert({
    where: { codigo: '4' },
    update: {},
    create: { codigo: '4', nome: 'PASSIVOS', tipo: 'PASSIVO' },
  })
  console.log('✅ Plano de Contas criado')

  // ─── CONTAS BANCÁRIAS ─────────────────────────────────────
  const caixaGeral = await prisma.contaBancaria.create({
    data: {
      nome: 'Caixa Geral',
      banco: 'Caixa',
      conta: '001',
      tipo: 'CAIXA',
      saldoAtual: 3500.00,
    },
  })
  const contaPrincipal = await prisma.contaBancaria.create({
    data: {
      nome: 'Conta Principal',
      banco: 'Banco do Brasil',
      agencia: '1234-5',
      conta: '56789-0',
      tipo: 'CORRENTE',
      saldoAtual: 15300.00,
    },
  })
  console.log('✅ Contas bancárias criadas')

  // ─── FORNECEDOR ───────────────────────────────────────────
  const fornecedor = await prisma.fornecedor.create({
    data: {
      nome: 'Imobiliária Central',
      cpfCnpj: '12.345.678/0001-90',
      email: 'contato@imobiliaria.com',
      telefone: '(11) 3456-7890',
    },
  })
  console.log('✅ Fornecedor criado')

  // ─── LANÇAMENTOS ──────────────────────────────────────────
  const lancamentosData = [
    // Mês atual — Receitas
    { tipo: 'RECEITA', categoria: 'Dízimo', valor: 2500.00, data: new Date(hoje.getFullYear(), hoje.getMonth(), 1), descricao: 'Dízimos culto domingo', contaPlanoId: contaDizimosMemb.id, contaBancariaId: caixaGeral.id, formaPagamento: 'ESPECIE', status: 'APROVADO', departamentoId: depts[0].id },
    { tipo: 'RECEITA', categoria: 'Oferta', valor: 850.00, data: new Date(hoje.getFullYear(), hoje.getMonth(), 1), descricao: 'Oferta culto domingo', contaPlanoId: contaOfertasCulto.id, contaBancariaId: caixaGeral.id, formaPagamento: 'ESPECIE', status: 'APROVADO' },
    { tipo: 'RECEITA', categoria: 'Dízimo', valor: 1800.00, data: new Date(hoje.getFullYear(), hoje.getMonth(), 8), descricao: 'Dízimos culto domingo', contaPlanoId: contaDizimosMemb.id, contaBancariaId: caixaGeral.id, formaPagamento: 'PIX', status: 'APROVADO', departamentoId: depts[0].id },
    { tipo: 'RECEITA', categoria: 'Doação', valor: 500.00, data: new Date(hoje.getFullYear(), hoje.getMonth(), 10), descricao: 'Doação especial', contaBancariaId: contaPrincipal.id, formaPagamento: 'PIX', status: 'APROVADO' },
    // Mês atual — Despesas
    { tipo: 'DESPESA', categoria: 'Água/Luz', valor: 420.00, data: new Date(hoje.getFullYear(), hoje.getMonth(), 5), descricao: 'Conta de energia elétrica', contaPlanoId: contaEnergia.id, contaBancariaId: contaPrincipal.id, formaPagamento: 'BOLETO', status: 'PAGO', fornecedorId: fornecedor.id },
    { tipo: 'DESPESA', categoria: 'Aluguel', valor: 1200.00, data: new Date(hoje.getFullYear(), hoje.getMonth(), 1), descricao: 'Aluguel do templo', contaPlanoId: contaAluguel.id, contaBancariaId: contaPrincipal.id, formaPagamento: 'TRANSFERENCIA', status: 'PAGO', fornecedorId: fornecedor.id },
    { tipo: 'DESPESA', categoria: 'Material', valor: 180.00, data: new Date(hoje.getFullYear(), hoje.getMonth(), 12), descricao: 'Material de escritório', contaPlanoId: contaMaterial.id, contaBancariaId: caixaGeral.id, formaPagamento: 'ESPECIE', status: 'APROVADO' },
    { tipo: 'DESPESA', categoria: 'Manutenção', valor: 750.00, data: new Date(hoje.getFullYear(), hoje.getMonth(), 15), descricao: 'Reparo no sistema de som', contaPlanoId: contaManutencao.id, contaBancariaId: caixaGeral.id, formaPagamento: 'PIX', status: 'PENDENTE' },
    // Mês anterior
    { tipo: 'RECEITA', categoria: 'Dízimo', valor: 3200.00, data: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 7), descricao: 'Dízimos culto domingo', contaPlanoId: contaDizimosMemb.id, contaBancariaId: caixaGeral.id, formaPagamento: 'ESPECIE', status: 'APROVADO' },
    { tipo: 'RECEITA', categoria: 'Oferta', valor: 1100.00, data: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 7), contaPlanoId: contaOfertasCulto.id, contaBancariaId: caixaGeral.id, formaPagamento: 'ESPECIE', status: 'APROVADO' },
    { tipo: 'DESPESA', categoria: 'Aluguel', valor: 1200.00, data: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1), contaPlanoId: contaAluguel.id, contaBancariaId: contaPrincipal.id, formaPagamento: 'TRANSFERENCIA', status: 'PAGO', fornecedorId: fornecedor.id },
    { tipo: 'DESPESA', categoria: 'Água/Luz', valor: 390.00, data: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 5), contaPlanoId: contaEnergia.id, contaBancariaId: contaPrincipal.id, formaPagamento: 'BOLETO', status: 'PAGO' },
    { tipo: 'DESPESA', categoria: 'Missões', valor: 300.00, data: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 15), contaPlanoId: contaMissoes.id, contaBancariaId: contaPrincipal.id, formaPagamento: 'TRANSFERENCIA', status: 'PAGO' },
    // 2 meses atrás
    { tipo: 'RECEITA', categoria: 'Dízimo', valor: 2900.00, data: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 7), contaPlanoId: contaDizimosMemb.id, contaBancariaId: caixaGeral.id, formaPagamento: 'ESPECIE', status: 'APROVADO' },
    { tipo: 'RECEITA', categoria: 'Oferta', valor: 750.00, data: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 7), contaPlanoId: contaOfertasCulto.id, contaBancariaId: caixaGeral.id, formaPagamento: 'ESPECIE', status: 'APROVADO' },
    { tipo: 'DESPESA', categoria: 'Aluguel', valor: 1200.00, data: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1), contaPlanoId: contaAluguel.id, contaBancariaId: contaPrincipal.id, formaPagamento: 'TRANSFERENCIA', status: 'PAGO', fornecedorId: fornecedor.id },
    { tipo: 'DESPESA', categoria: 'Manutenção', valor: 450.00, data: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 18), contaPlanoId: contaManutencao.id, contaBancariaId: caixaGeral.id, formaPagamento: 'ESPECIE', status: 'PAGO' },
  ]

  await prisma.lancamento.createMany({ data: lancamentosData as any[] })
  console.log('✅ Lançamentos financeiros criados:', lancamentosData.length)

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📋 Credenciais de acesso:')
  console.log('   Admin  — admin@peniel.com / admin123')
  console.log('   Tesour — tesoureiro@peniel.com / admin123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
