import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'

/** Estrutura geral: área de conteúdo rolável + navegação inferior fixa. */
export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <div className="flex h-[100dvh] flex-col bg-bg text-text">
      <main className="safe-top safe-x flex-1 overflow-y-auto overscroll-none">
        {/* h-full permite que a tela do afinador preencha a altura exata (sem
            rolagem); páginas mais altas (textos de Ajustes) ainda rolam. */}
        <div key={location.pathname} className="mx-auto h-full w-full max-w-md animate-page-enter">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
