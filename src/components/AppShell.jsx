import clsx from 'clsx'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import HitlModal from './HitlModal.jsx'

export default function AppShell({ route, status, sessionId, hitlOpen, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-page">
      <Sidebar route={route} status={status} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar sessionId={sessionId} status={status} />
        {hitlOpen && (
          <div className="shrink-0 border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-900">
            Human approval required — Approve or Reject in the dialog below
          </div>
        )}
        <main
          className={clsx(
            'min-h-0 flex-1',
            route === 'hub' ? 'overflow-hidden' : 'overflow-y-auto',
          )}
        >
          {children}
        </main>
      </div>
      <HitlModal hitlOpen={hitlOpen} />
    </div>
  )
}
