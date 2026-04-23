'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/financeiro', label: 'Visão Geral', exact: true },
  { href: '/financeiro/plano-de-contas', label: 'Plano de Contas' },
  { href: '/financeiro/receitas', label: 'Receitas' },
  { href: '/financeiro/despesas', label: 'Despesas' },
  { href: '/financeiro/aprovacoes', label: 'Aprovações' },
  { href: '/financeiro/caixa-culto', label: 'Caixa de Culto' },
  { href: '/financeiro/contas-bancarias', label: 'Contas Bancárias' },
  { href: '/financeiro/orcamento', label: 'Orçamento' },
  { href: '/financeiro/fornecedores', label: 'Fornecedores' },
  { href: '/financeiro/relatorios', label: 'Relatórios' },
]

export default function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 flex overflow-x-auto gap-1 py-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0',
                  isActive
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
