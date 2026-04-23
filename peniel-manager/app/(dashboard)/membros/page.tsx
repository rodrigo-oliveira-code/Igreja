'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/dashboard/Header'
import {
  UserPlus, Search, SlidersHorizontal, X, Check, Pencil, ExternalLink, ChevronDown,
} from 'lucide-react'
import { formatDate, STATUS_MEMBRO_LABELS, STATUS_COLORS } from '@/lib/utils'

interface Departamento { id: string; nome: string; cor: string }

interface Membro {
  id: string
  nome: string
  email?: string
  telefone?: string
  status: string
  dataNascimento?: string
  dataIngresso?: string
  dataBatismoAguas?: string
  dataOrdenacaoCooperador?: string
  dataOrdenacaoDiacono?: string
  dataOrdenacaoPresbitero?: string
  dataOrdenacaoPastor?: string
  departamentos: Array<{ departamento: Departamento }>
}

// ── Filter types ────────────────────────────────────────────────────────────

type FilterField =
  | 'status'
  | 'departamento'
  | 'batismo'
  | 'ordenacao'
  | 'ingresso_de'
  | 'ingresso_ate'
  | 'nascimento_de'
  | 'nascimento_ate'

const FILTER_LABELS: Record<FilterField, string> = {
  status: 'Status',
  departamento: 'Departamento',
  batismo: 'Batismo nas Águas',
  ordenacao: 'Ordenação',
  ingresso_de: 'Ingresso — de',
  ingresso_ate: 'Ingresso — até',
  nascimento_de: 'Nascimento — de',
  nascimento_ate: 'Nascimento — até',
}

interface ActiveFilter {
  field: FilterField
  value: string
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function applyFilters(membros: Membro[], filters: ActiveFilter[], search: string): Membro[] {
  return membros.filter((m) => {
    if (search) {
      const q = search.toLowerCase()
      if (!m.nome.toLowerCase().includes(q) && !(m.email || '').toLowerCase().includes(q)) return false
    }
    for (const f of filters) {
      if (!f.value) continue
      if (f.field === 'status' && m.status !== f.value) return false
      if (f.field === 'departamento' && !m.departamentos.some((d) => d.departamento.id === f.value)) return false
      if (f.field === 'batismo') {
        const has = !!m.dataBatismoAguas
        if (f.value === 'sim' && !has) return false
        if (f.value === 'nao' && has) return false
      }
      if (f.field === 'ordenacao') {
        const fields = ['dataOrdenacaoCooperador', 'dataOrdenacaoDiacono', 'dataOrdenacaoPresbitero', 'dataOrdenacaoPastor'] as const
        const has = fields.some((k) => !!m[k])
        if (f.value === 'sim' && !has) return false
        if (f.value === 'nao' && has) return false
      }
      if (f.field === 'ingresso_de' && m.dataIngresso && m.dataIngresso < f.value) return false
      if (f.field === 'ingresso_ate' && m.dataIngresso && m.dataIngresso > f.value) return false
      if (f.field === 'nascimento_de' && m.dataNascimento && m.dataNascimento < f.value) return false
      if (f.field === 'nascimento_ate' && m.dataNascimento && m.dataNascimento > f.value) return false
    }
    return true
  })
}

// ── Filter Panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  filters, setFilters, departamentos, onClose,
}: {
  filters: ActiveFilter[]
  setFilters: (f: ActiveFilter[]) => void
  departamentos: Departamento[]
  onClose: () => void
}) {
  const [addingField, setAddingField] = useState<FilterField | ''>('')
  const available = (Object.keys(FILTER_LABELS) as FilterField[]).filter(
    (f) => !filters.some((af) => af.field === f)
  )

  function setFilter(field: FilterField, value: string) {
    setFilters(filters.map((f) => f.field === field ? { ...f, value } : f))
  }

  function addFilter(field: FilterField) {
    setFilters([...filters, { field, value: '' }])
    setAddingField('')
  }

  function removeFilter(field: FilterField) {
    setFilters(filters.filter((f) => f.field !== field))
  }

  function renderControl(f: ActiveFilter) {
    if (f.field === 'status') {
      return (
        <select value={f.value} onChange={(e) => setFilter(f.field, e.target.value)} className="input-field">
          <option value="">Selecione</option>
          {Object.entries(STATUS_MEMBRO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      )
    }
    if (f.field === 'departamento') {
      return (
        <select value={f.value} onChange={(e) => setFilter(f.field, e.target.value)} className="input-field">
          <option value="">Selecione</option>
          {departamentos.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
      )
    }
    if (f.field === 'batismo' || f.field === 'ordenacao') {
      return (
        <select value={f.value} onChange={(e) => setFilter(f.field, e.target.value)} className="input-field">
          <option value="">Selecione</option>
          <option value="sim">Sim (possui)</option>
          <option value="nao">Não (não possui)</option>
        </select>
      )
    }
    return (
      <input
        type="date"
        value={f.value}
        onChange={(e) => setFilter(f.field, e.target.value)}
        className="input-field"
      />
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">Filtros ativos</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>

      {filters.length === 0 && (
        <p className="text-sm text-gray-400 mb-4">Nenhum filtro adicionado.</p>
      )}

      <div className="space-y-3 mb-4">
        {filters.map((f) => (
          <div key={f.field} className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 w-40 flex-shrink-0">{FILTER_LABELS[f.field]}</span>
            <div className="flex-1">{renderControl(f)}</div>
            <button onClick={() => removeFilter(f.field)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {available.length > 0 && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <select
            value={addingField}
            onChange={(e) => e.target.value && addFilter(e.target.value as FilterField)}
            className="input-field text-sm"
          >
            <option value="">+ Adicionar filtro...</option>
            {available.map((f) => <option key={f} value={f}>{FILTER_LABELS[f]}</option>)}
          </select>
          {filters.length > 0 && (
            <button
              onClick={() => setFilters([])}
              className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
            >
              Limpar todos
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Inline Edit Row ──────────────────────────────────────────────────────────

function MembroRow({
  membro, onSaved,
}: {
  membro: Membro
  onSaved: (updated: Membro) => void
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nome: membro.nome,
    email: membro.email || '',
    telefone: membro.telefone || '',
    status: membro.status,
  })

  function reset() {
    setForm({ nome: membro.nome, email: membro.email || '', telefone: membro.telefone || '', status: membro.status })
    setEditing(false)
  }

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/membros/${membro.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...membro,
        nome: form.nome,
        email: form.email || null,
        telefone: form.telefone || null,
        status: form.status,
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      onSaved({ ...membro, ...updated })
      setEditing(false)
    }
    setSaving(false)
  }

  const inp = 'border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-purple-500 outline-none w-full'

  return (
    <tr className={`border-b border-gray-100 transition-colors ${editing ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
      {/* Nome */}
      <td className="px-4 py-3">
        {editing ? (
          <input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className={inp} />
        ) : (
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-900">{membro.nome}</span>
          </div>
        )}
      </td>

      {/* Email */}
      <td className="px-4 py-3">
        {editing ? (
          <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={inp} placeholder="email" />
        ) : (
          <span className="text-gray-500 text-sm">{membro.email || '—'}</span>
        )}
      </td>

      {/* Telefone */}
      <td className="px-4 py-3">
        {editing ? (
          <input value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} className={inp} placeholder="telefone" />
        ) : (
          <span className="text-gray-500 text-sm">{membro.telefone || '—'}</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        {editing ? (
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className={inp}>
            {Object.entries(STATUS_MEMBRO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        ) : (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[membro.status]}`}>
            {STATUS_MEMBRO_LABELS[membro.status]}
          </span>
        )}
      </td>

      {/* Departamentos */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {membro.departamentos.map((d, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: d.departamento.cor }}>
              {d.departamento.nome}
            </span>
          ))}
        </div>
      </td>

      {/* Ingresso */}
      <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">
        {membro.dataIngresso ? formatDate(membro.dataIngresso) : '—'}
      </td>

      {/* Ações */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          {editing ? (
            <>
              <button onClick={save} disabled={saving} title="Salvar" className="p-1.5 rounded-lg text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={reset} title="Cancelar" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} title="Editar" className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <Link href={`/membros/${membro.id}`} title="Ver perfil completo" className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50">
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MembrosPage() {
  const [membros, setMembros] = useState<Membro[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ActiveFilter[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/membros').then((r) => r.json()),
      fetch('/api/departamentos').then((r) => r.json()),
    ]).then(([m, d]) => {
      setMembros(m)
      setDepartamentos(d)
      setLoading(false)
    })
  }, [])

  function handleSaved(updated: Membro) {
    setMembros((prev) => prev.map((m) => m.id === updated.id ? { ...m, ...updated } : m))
  }

  const filtered = applyFilters(membros, filters, search)
  const activeCount = filters.filter((f) => f.value).length

  return (
    <div>
      <Header title="Membros" />
      <div className="p-6">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || activeCount > 0
                ? 'bg-purple-50 border-purple-300 text-purple-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeCount > 0 && (
              <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
          <Link
            href="/membros/novo"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Novo Membro
          </Link>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            departamentos={departamentos}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Active filter chips */}
        {!showFilters && activeCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.filter((f) => f.value).map((f) => (
              <span key={f.field} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {FILTER_LABELS[f.field]}: {f.value}
                <button onClick={() => setFilters(filters.map((af) => af.field === f.field ? { ...af, value: '' } : af))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>Nenhum membro encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Telefone</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Departamentos</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ingresso</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((membro) => (
                    <MembroRow key={membro.id} membro={membro} onSaved={handleSaved} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-2">
          {filtered.length} de {membros.length} membro(s)
        </p>
      </div>
    </div>
  )
}
