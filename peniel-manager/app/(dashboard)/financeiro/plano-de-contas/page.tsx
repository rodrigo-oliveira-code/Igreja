'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Plus, Edit2, ToggleLeft, ToggleRight, ChevronRight, ChevronDown } from 'lucide-react'

interface Conta {
  id: string
  codigo: string
  nome: string
  tipo: 'RECEITA' | 'DESPESA' | 'ATIVO' | 'PASSIVO'
  paiId: string | null
  ativo: boolean
}

const TIPO_COLORS: Record<string, string> = {
  RECEITA: 'bg-green-100 text-green-700',
  DESPESA: 'bg-red-100 text-red-700',
  ATIVO: 'bg-blue-100 text-blue-700',
  PASSIVO: 'bg-orange-100 text-orange-700',
}
const TIPO_LABELS: Record<string, string> = {
  RECEITA: 'Receita',
  DESPESA: 'Despesa',
  ATIVO: 'Ativo',
  PASSIVO: 'Passivo',
}

function ContaRow({
  conta,
  level,
  allContas,
  onEdit,
  onToggle,
}: {
  conta: Conta
  level: number
  allContas: Conta[]
  onEdit: (c: Conta) => void
  onToggle: (id: string, ativo: boolean) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const filhos = allContas
    .filter((c) => c.paiId === conta.id)
    .sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true }))

  return (
    <>
      <tr className={`hover:bg-gray-50 transition-colors ${!conta.ativo ? 'opacity-40' : ''}`}>
        <td className="px-4 py-3">
          <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
            {filhos.length > 0 ? (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mr-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-5 mr-1 flex-shrink-0" />
            )}
            <span className={`font-mono text-sm ${level === 0 ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
              {conta.codigo}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`text-sm ${level === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
            {conta.nome}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TIPO_COLORS[conta.tipo]}`}>
            {TIPO_LABELS[conta.tipo]}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => onEdit(conta)}
              className="text-gray-400 hover:text-purple-600 transition-colors"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggle(conta.id, !conta.ativo)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title={conta.ativo ? 'Desativar' : 'Ativar'}
            >
              {conta.ativo
                ? <ToggleRight className="w-5 h-5 text-green-500" />
                : <ToggleLeft className="w-5 h-5" />}
            </button>
          </div>
        </td>
      </tr>
      {expanded &&
        filhos.map((filho) => (
          <ContaRow
            key={filho.id}
            conta={filho}
            level={level + 1}
            allContas={allContas}
            onEdit={onEdit}
            onToggle={onToggle}
          />
        ))}
    </>
  )
}

function ContaModal({
  conta,
  allContas,
  onClose,
  onSave,
}: {
  conta: Partial<Conta> | null
  allContas: Conta[]
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({
    codigo: conta?.codigo || '',
    nome: conta?.nome || '',
    tipo: conta?.tipo || 'RECEITA',
    paiId: conta?.paiId || '',
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const method = conta?.id ? 'PUT' : 'POST'
    const url = conta?.id ? `/api/plano-de-contas/${conta.id}` : '/api/plano-de-contas'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, paiId: form.paiId || null }),
    })
    onSave()
    onClose()
  }

  const contasDisponiveis = allContas.filter((c) => c.id !== conta?.id && c.ativo)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {conta?.id ? 'Editar Conta' : 'Nova Conta'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                type="text"
                value={form.codigo}
                onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))}
                required
                placeholder="ex: 1.1.2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="RECEITA">Receita</option>
                <option value="DESPESA">Despesa</option>
                <option value="ATIVO">Ativo</option>
                <option value="PASSIVO">Passivo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              required
              placeholder="Nome da conta"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conta Pai</label>
            <select
              value={form.paiId}
              onChange={(e) => setForm((p) => ({ ...p, paiId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="">Sem pai (conta raiz)</option>
              {contasDisponiveis.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} — {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={onClose}
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

export default function PlanoDeContasPage() {
  const [contas, setContas] = useState<Conta[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ conta: Partial<Conta> | null } | null>(null)
  const [showInativos, setShowInativos] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/plano-de-contas')
    const data = await res.json()
    setContas(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleToggle(id: string, ativo: boolean) {
    await fetch(`/api/plano-de-contas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo }),
    })
    load()
  }

  const visibleContas = showInativos ? contas : contas.filter((c) => c.ativo)
  const rootContas = visibleContas
    .filter((c) => !c.paiId)
    .sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true }))

  return (
    <div>
      <Header title="Financeiro" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Plano de Contas</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {contas.filter((c) => c.ativo).length} contas ativas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showInativos}
                onChange={(e) => setShowInativos(e.target.checked)}
                className="rounded"
              />
              Mostrar inativos
            </label>
            <button
              onClick={() => setModal({ conta: null })}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Nova Conta
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : contas.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">Nenhuma conta cadastrada</p>
              <button
                onClick={() => setModal({ conta: null })}
                className="mt-3 text-purple-600 hover:underline text-sm"
              >
                Criar primeira conta
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Código
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    Tipo
                  </th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rootContas.map((conta) => (
                  <ContaRow
                    key={conta.id}
                    conta={conta}
                    level={0}
                    allContas={visibleContas}
                    onEdit={(c) => setModal({ conta: c })}
                    onToggle={handleToggle}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <ContaModal
          conta={modal.conta}
          allContas={contas}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}
    </div>
  )
}
