import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Notificator from './Notificator.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Notificator />
  </StrictMode>,
)
