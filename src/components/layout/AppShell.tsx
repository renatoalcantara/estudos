import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

/** Estrutura geral: área de conteúdo rolável + navegação inferior fixa. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] flex-col bg-bg text-text">
      <main className="safe-top safe-x flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
