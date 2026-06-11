import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { UpdateToast } from './components/layout/UpdateToast'
import { SettingsProvider } from './context/SettingsContext'
import { PATHS } from './routes/paths'
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
