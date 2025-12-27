import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GhostStudio } from './App'
import { ErrorBoundary } from '@super-son1k/shared-ui'
import './styles/ghost.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GhostStudio />
    </ErrorBoundary>
  </StrictMode>,
)
