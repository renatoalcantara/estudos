import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { UpdateToast } from './components/layout/UpdateToast'
import { SettingsProvider } from './context/SettingsContext'
import { initAnalytics, trackPageView } from './lib/analytics/analytics'
import { PATHS } from './routes/paths'

// Nomes legíveis por rota → vira o page_title no GA (acessos por área de Ajustes).
const PAGE_TITLES: Record<string, string> = {
  [PATHS.tuner]: 'Afinador',
  [PATHS.settings]: 'Ajustes',
  [PATHS.about]: 'Ajustes · Sobre',
  [PATHS.donations]: 'Ajustes · Doações',
  [PATHS.contact]: 'Ajustes · Fale conosco',
  [PATHS.terms]: 'Ajustes · Termos',
  [PATHS.privacy]: 'Ajustes · Privacidade',
}

/** Inicializa o analytics e dispara page_view a cada mudança de rota. */
function AnalyticsTracker() {
  const location = useLocation()
  useEffect(() => {
    initAnalytics()
  }, [])
  useEffect(() => {
    trackPageView(location.pathname + location.search, PAGE_TITLES[location.pathname])
  }, [location.pathname, location.search])
  return null
}
import { TunerPage } from './routes/TunerPage'
import { AboutPage } from './routes/settings/AboutPage'
import { ContactPage } from './routes/settings/ContactPage'
import { DonationsPage } from './routes/settings/DonationsPage'
import { PrivacyPage } from './routes/settings/PrivacyPage'
import { SettingsPage } from './routes/settings/SettingsPage'
import { TermsPage } from './routes/settings/TermsPage'

export function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <AnalyticsTracker />
        <AppShell>
          <Routes>
            <Route path={PATHS.tuner} element={<TunerPage />} />
            <Route path={PATHS.settings} element={<SettingsPage />} />
            <Route path={PATHS.about} element={<AboutPage />} />
            <Route path={PATHS.donations} element={<DonationsPage />} />
            <Route path={PATHS.contact} element={<ContactPage />} />
            <Route path={PATHS.terms} element={<TermsPage />} />
            <Route path={PATHS.privacy} element={<PrivacyPage />} />
            <Route path="*" element={<Navigate to={PATHS.tuner} replace />} />
          </Routes>
        </AppShell>
        <UpdateToast />
      </HashRouter>
    </SettingsProvider>
  )
}
