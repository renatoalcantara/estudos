import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'

/** Estrutura geral: área de conteúdo rolável + navegação inferior fixa. */
export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    // Container travado em 100dvh (via #root). O nav é absolute bottom-0. As
    // páginas que ROLAM reservam a altura dele com pb-[--nav-h]; a tela do
    // afinador (100%, sem rolagem) usa a área toda, com a nav flutuando por cima.
    <div className="relative h-full overflow-hidden bg-bg text-text">
      <main className="safe-top safe-x h-full overflow-y-auto overscroll-none">
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
