import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MillionaireTrivia from './Millionaire_Trivia.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MillionaireTrivia />
  </StrictMode>,
)
