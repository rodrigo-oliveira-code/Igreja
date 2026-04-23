'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/dashboard/Header'
import { ArrowLeft } from 'lucide-react'

const ESTADO_CIVIL_OPTIONS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável']

export default function NovoMembroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    rg: '',
    estadoCivil: '',
    profissao: '',
    naturalidade: '',
    nomePai: '',
    nomeMae: '',
    dataNascimento: '',
    dataIngresso: '',
    status: 'ATIVO',
    endereco: '',
    observacoes: '',
    dataBatismoAguas: '',
    dataOrdenacaoCooperador: '',
    dataOrdenacaoDiacono: '',
    dataOrdenacaoPresbitero: '',
    dataOrdenacaoPastor: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/membros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.push('/membros')
    } else {
      const data = await res.json()
      setError(data.error || 'Erro ao cadastrar membro')
      setLoading(false)
    }
  }

  return (
    <div>
      <Header title="Novo Membro" />
      <div className="p-6 max-w-3xl">
        <Link href="/membros" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Dados Pessoais */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Dados Pessoais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input name="nome" value={form.nome} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input name="telefone" value={form.telefone} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
                <input name="rg" value={form.rg} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <input name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naturalidade</label>
                <input name="naturalidade" value={form.naturalidade} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                <select name="estadoCivil" value={form.estadoCivil} onChange={handleChange} className="input-field">
                  <option value="">Selecione</option>
                  {ESTADO_CIVIL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                <input name="profissao" value={form.profissao} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Pai</label>
                <input name="nomePai" value={form.nomePai} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Mãe</label>
                <input name="nomeMae" value={form.nomeMae} onChange={handleChange} className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input name="endereco" value={form.endereco} onChange={handleChange} className="input-field" />
              </div>
            </div>
          </div>

          {/* Dados Eclesiásticos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Dados Eclesiásticos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="input-field">
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                  <option value="VISITANTE">Visitante</option>
                  <option value="TRANSFERIDO">Transferido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Ingresso</label>
                <input name="dataIngresso" type="date" value={form.dataIngresso} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batismo nas Águas</label>
                <input name="dataBatismoAguas" type="date" value={form.dataBatismoAguas} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenação — Cooperador</label>
                <input name="dataOrdenacaoCooperador" type="date" value={form.dataOrdenacaoCooperador} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenação — Diácono</label>
                <input name="dataOrdenacaoDiacono" type="date" value={form.dataOrdenacaoDiacono} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenação — Presbítero</label>
                <input name="dataOrdenacaoPresbitero" type="date" value={form.dataOrdenacaoPresbitero} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenação — Pastor</label>
                <input name="dataOrdenacaoPastor" type="date" value={form.dataOrdenacaoPastor} onChange={handleChange} className="input-field" />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Observações</h2>
            <textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows={4} className="input-field resize-none w-full" />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium text-sm"
            >
              {loading ? 'Salvando...' : 'Cadastrar'}
            </button>
            <Link href="/membros" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
