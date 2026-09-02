import { useEffect } from 'react'
import AppShell from './components/AppShell.jsx'
import Entrance from './pages/Entrance.jsx'
import CustomScenario from './pages/CustomScenario.jsx'
import Setup from './pages/Setup.jsx'
import Hub from './pages/Hub.jsx'
import Advisor from './pages/Advisor.jsx'
import Audit from './pages/Audit.jsx'
import Summary from './pages/Summary.jsx'
import { useDeal } from './lib/useDeal.js'

function PageRouter({ route }) {
  switch (route) {
    case 'entrance':
      return <Entrance />
    case 'custom':
      return <CustomScenario />
    case 'setup':
      return <Setup />
    case 'hub':
      return <Hub />
    case 'advisor':
      return <Advisor />
    case 'audit':
      return <Audit />
    case 'summary':
      return <Summary />
    default:
      return <Entrance />
  }
}

export default function App() {
  const { route, status, deal, hitlOpen } = useDeal()

  useEffect(() => {
    import('./lib/webmcp.js')
      .then(({ registerNegotiationTools }) => registerNegotiationTools())
      .catch(() => {})
  }, [])

  return (
    <AppShell route={route} status={status} sessionId={deal?.sessionId} hitlOpen={hitlOpen}>
      <PageRouter route={route} />
    </AppShell>
  )
}
