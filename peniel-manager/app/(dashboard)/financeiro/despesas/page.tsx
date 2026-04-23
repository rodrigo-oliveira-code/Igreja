'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Plus, TrendingDown, Search, Edit2, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Lancamento {
  id: string
  tipo: string
  categoria: string | null
  valor: number
  descricao: string | null
  data: string
  status: string
  formaPagamento: string | null
  contaPlano: { id: string; codigo: string; nome: string } | null
  departamento: { id: string; nome: string } | null
  contaBancaria: { id: string; nome: string; banco: string } | null
  fornecedor: { id: string; nome: string } | null
}

interface PlanoItem { id: string; codigo: string; nome: string; tipo: string }
interface Depto { id: string; nome: string }
interface ContaB { id: string; nome: string; banco: string }
interface Fornecedor { id: string; nome: string }

const FORMAS = ['ESPECIE', 'PIX', 'CARTAO', 'CHEQUE', 'TRANSFERENCIA', 'BOLETO', 'DEBITO']
const FORMA_LABELS: Record<string, string> = {
  ESPECIE: 'Espécie', PIX: 'PIX', CARTAO: 'Cartão', CHEQUE: 'Cheque',
  TRANSFERENCIA: 'Transferência', BOLETO: 'Boleto', DEBITO: 'Débito',
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  RASCUNHO: { label: 'Rascunho', cls: 'bg-gray-100 text-gray-600' },
  PENDENTE: { label: 'Pendente', cls: 'bg-orange-100 text-orange-700' },
  APROVADO: { label: 'Aprovado', cls: 'bg-green-100 text-green-700' },
  PAGO: { label: 'Pago', cls: 'bg-blue-100 text-blue-700' },
  REJEITADO: { label: 'Rejeitado', cls: 'bg-red-100 text-red-700' },
}

function StatusBadge({ status }: { status: string }) {
  const { label, cls } = STATUS_MAP[status] || { label: status, cls: 'bg-gray-100 text-gray-600' }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{label}</span>
}

function DespesaModal({
  lancamento, plano, deptos, contas, fornecedores, onClose, onSave,
}: {
  lancamento: Partial<Lancamento> | null
  plano: PlanoItem[]
  deptos: Depto[]
  contas: ContaB[]
  fornecedores: Fornecedor[]
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({
    valor: lancamento?.valor ? String(lancamento.valor) : '',
    descricao: lancamento?.descricao || '',
    data: lancamento?.data ? lancamento.data.split('T')[0] : new Date().toISOString().split('T')[0],
    contaPlanoId: lancamento?.contaPlano?.id || '',
    departamentoId: lancamento?.departamento?.id || '',
    contaBancariaId: lancamento?.contaBancaria?.id || '',
    fornecedorId: lancamento?.fornecedor?.id || '',
    formaPagamento: lancamento?.formaPagamento || '',
    status: lancamento?.status || 'PENDENTE',
  })
  const [loading, setLoading] = useState(false)

  const planoDespesas = plano.filter((p) => p.tipo === 'DESPESA')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const method = lancamento?.id ? 'PUT' : 'POST'
    const url = lancamento?.id ? `/api/lancamentos/${lancamento.id}` : '/api/lancamentos'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'DESPESA',
        valor: parseFloat(form.valor),
        descricao: form.descricao || null,
        data: form.data,
        contaPlanoId: form.contaPlanoId || null,
        departamentoId: form.departamentoId || null,
        contaBancariaId: form.contaBancariaId || null,
        fornecedorId: form.fornecedorId || null,
        formaPagamento: form.formaPagamento || null,
        status: form.status,
      }),
    })
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {lancamento?.id ? 'Editar Despesa' : 'Nova Despesa'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
              <input
                type="number" step="0.01" min="0" required
                value={form.valor}
                onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input
                type="date" required
                value={form.data}
                onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conta do Plano</label>
            <select
              value={form.contaPlanoId}
              onChange={(e) => setForm((p) => ({ ...p, contaPlanoId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="">Selecione a conta...</option>
              {planoDespesas.map((c) => (
                <option key={c.id} value={c.id}>{c.codigo} — {c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor / Beneficiário</label>
            <select
              value={form.fornecedorId}
              onChange={(e) => setForm((p) => ({ ...p, fornecedorId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="">Selecione...</option>
              {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
              <select
                value={form.formaPagamento}
                onChange={(e) => setForm((p) => ({ ...p, formaPagamento: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="">Selecione...</option>
                {FORMAS.map((f) => <option key={f} value={f}>{FORMA_LABELS[f]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conta Bancária</label>
              <select
                value={form.contaBancariaId}
                onChange={(e) => setForm((p) => ({ ...p, contaBancariaId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="">Selecione...</option>
                {contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <select
                value={form.departamentoId}
                onChange={(e) => setForm((p) => ({ ...p, departamentoId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="">Nenhum</option>
                {deptos.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="PENDENTE">Pendente (aguarda aprovação)</option>
                <option value="APROVADO">Aprovado</option>
                <option value="PAGO">Pago</option>
                <option value="RASCUNHO">Rascunho</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <textarea
              required
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DespesasPage() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ lancamento: Partial<Lancamento> | null } | null>(null)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [plano, setPlano] = useState<PlanoItem[]>([])
  const [deptos, setDeptos] = useState<Depto[]>([])
  const [contas, setContas] = useState<ContaB[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  async function load() {
    setLoading(true)
    const q = new URLSearchParams({ tipo: 'DESPESA', mes: String(mes), ano: String(ano), ativo: 'true' })
    if (filtroStatus) q.set('status', filtroStatus)
    const res = await fetch(`/api/lancamentos?${q}`)
    setLancamentos(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    load()
    fetch('/api/plano-de-contas?ativo=true').then((r) => r.json()).then(setPlano)
    fetch('/api/departamentos').then((r) => r.json()).then(setDeptos)
    fetch('/api/contas-bancarias?ativa=true').then((r) => r.json()).then(setContas)
    fetch('/api/fornecedores?ativo=true').then((r) => r.json()).then(setFornecedores)
  }, [mes, ano, filtroStatus])

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta despesa?')) return
    await fetch(`/api/lancamentos/${id}`, { method: 'DELETE' })
    load()
  }

  const filtrados = lancamentos.filter(
    (l) =>
      !busca ||
      l.contaPlano?.nome.toLowerCase().includes(busca.toLowerCase()) ||
      l.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      l.fornecedor?.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const total = filtrados.reduce((s, l) => s + Number(l.valor), 0)
  const pendentes = filtrados.filter((l) => l.status === 'PENDENTE').length

  return (
    <div>
      <Header title="Financeiro" />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              {meses.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="">Todos os status</option>
              <option value="RASCUNHO">Rascunho</option>
              <option value="PENDENTE">Pendente</option>
              <option value="APROVADO">Aprovado</option>
              <option value="PAGO">Pago</option>
              <option value="REJEITADO">Rejeitado</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Buscar..."
                value={busca} onChange={(e) => setBusca(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none w-48"
              />
            </div>
          </div>
          <button
            onClick={() => setModal({ lancamento: null })}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Nova Despesa
          </button>
        </div>

        {/* Resumo */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-red-700">Total de despesas — {meses[mes - 1]} {ano}</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(total)}</p>
          </div>
          {pendentes > 0 && (
            <div className="ml-auto text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                {pendentes} pendente{pendentes !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma despesa neste período</p>
              <button
                onClick={() => setModal({ lancamento: null })}
                className="mt-3 text-red-600 hover:underline text-sm"
              >
                Registrar despesa
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Conta / Descrição</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Forma</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-4 py-3 w-20" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtrados.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(l.data)}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">
                          {l.contaPlano ? `${l.contaPlano.codigo} — ${l.contaPlano.nome}` : l.categoria || '—'}
                        </p>
                        {l.descricao && <p className="text-xs text-gray-400 mt-0.5">{l.descricao}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{l.fornecedor?.nome || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{l.departamento?.nome || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {l.formaPagamento ? FORMA_LABELS[l.formaPagamento] || l.formaPagamento : '—'}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600 whitespace-nowrap">
                        -{formatCurrency(l.valor)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModal({ lancamento: l })}
                            className="text-gray-400 hover:text-purple-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(l.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-red-50">
                    <td colSpan={6} className="px-4 py-3 text-sm font-semibold text-gray-700">
                      Total ({filtrados.length} lançamento{filtrados.length !== 1 ? 's' : ''})
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-700">
                      -{formatCurrency(total)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <DespesaModal
          lancamento={modal.lancamento}
          plano={plano}
          deptos={deptos}
          contas={contas}
          fornecedores={fornecedores}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}
    </div>
  )
}
