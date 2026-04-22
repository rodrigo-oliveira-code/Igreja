'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/dashboard/Header'
import { UserPlus, Search, Filter } from 'lucide-react'
import { formatDate, STATUS_MEMBRO_LABELS, STATUS_COLORS, cn } from '@/lib/utils'

interface Membro {
  id: string
  nome: string
  email?: string
  telefone?: string
  status: string
  dataNascimento?: string
  dataIngresso?: string
  departamentos: Array<{ departamento: { nome: string; cor: string } }>
}

export default function MembrosPage() {
  const [membros, setMembros] = useState<Membro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  async function loadMembros() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/membros?${params}`)
    const data = await res.json()
    setMembros(data)
    setLoading(false)
  }

  useEffect(() => { loadMembros() }, [search, statusFilter])

  return (
    <div>
      <Header title="Membros" />
      <div className="p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_MEMBRO_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <Link
            href="/membros/novo"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Novo Membro
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : membros.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>Nenhum membro encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Nome</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Contato</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Departamentos</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Ingresso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {membros.map((membro) => (
                    <tr key={membro.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/membros/${membro.id}`} className="font-medium text-gray-900 hover:text-purple-600">
                          {membro.nome}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div>{membro.email}</div>
                        <div>{membro.telefone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[membro.status]}`}>
                          {STATUS_MEMBRO_LABELS[membro.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {membro.departamentos.map((d, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full text-xs text-white"
                              style={{ backgroundColor: d.departamento.cor }}
                            >
                              {d.departamento.nome}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {membro.dataIngresso ? formatDate(membro.dataIngresso) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-2">{membros.length} membro(s) encontrado(s)</p>
      </div>
    </div>
  )
}
