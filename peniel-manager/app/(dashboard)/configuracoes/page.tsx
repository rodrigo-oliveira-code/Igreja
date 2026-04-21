'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/dashboard/Header'
import { Save, Plus, Trash2 } from 'lucide-react'

interface User {
  id: string
  nome: string
  email: string
  role: string
  createdAt: string
}

export default function ConfiguracoesPage() {
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'ADMIN'
  const [users, setUsers] = useState<User[]>([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [userForm, setUserForm] = useState({ nome: '', email: '', password: '', role: 'MEMBRO' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/users').then((r) => r.json()).then(setUsers)
    }
  }, [isAdmin])

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm),
    })
    if (res.ok) {
      const user = await res.json()
      setUsers((prev) => [...prev, user])
      setUserForm({ nome: '', email: '', password: '', role: 'MEMBRO' })
      setShowUserForm(false)
      setMessage('Usuário criado com sucesso!')
      setTimeout(() => setMessage(''), 3000)
    }
    setSaving(false)
  }

  const ROLES: Record<string, string> = { ADMIN: 'Administrador', LIDER: 'Líder', MEMBRO: 'Membro' }

  return (
    <div>
      <Header title="Configurações" />
      <div className="p-6 max-w-3xl space-y-6">
        {message && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{message}</div>
        )}

        {/* Church Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações da Igreja</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Igreja</label>
              <input defaultValue="Igreja Peniel" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <input placeholder="00.000.000/0000-00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input placeholder="Rua, número, bairro, cidade" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input placeholder="(00) 00000-0000" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email da Igreja</label>
              <input type="email" placeholder="contato@igrejapenie.com.br" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">* Integração com banco de dados em breve</p>
        </div>

        {/* User Management - ADMIN only */}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Usuários do Sistema</h2>
              <button onClick={() => setShowUserForm(!showUserForm)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                <Plus className="w-4 h-4" /> Novo Usuário
              </button>
            </div>

            {showUserForm && (
              <form onSubmit={handleCreateUser} className="bg-gray-50 rounded-lg p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
                  <input value={userForm.nome} onChange={(e) => setUserForm((p) => ({ ...p, nome: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Senha</label>
                  <input type="password" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Perfil</label>
                  <select value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
                    {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
                    {saving ? 'Criando...' : 'Criar Usuário'}
                  </button>
                  <button type="button" onClick={() => setShowUserForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Nome</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Perfil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{u.nome}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'LIDER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {ROLES[u.role]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* About */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Sobre o Sistema</h2>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">Versão</dt>
            <dd className="font-medium text-gray-800">1.0.0</dd>
            <dt className="text-gray-500">Framework</dt>
            <dd className="font-medium text-gray-800">Next.js 16 + React 19</dd>
            <dt className="text-gray-500">Banco de Dados</dt>
            <dd className="font-medium text-gray-800">PostgreSQL 16 + Prisma</dd>
            <dt className="text-gray-500">Deploy</dt>
            <dd className="font-medium text-gray-800">Docker + VPS</dd>
          </dl>
        </div>
      </div>
    </div>
  )
}
