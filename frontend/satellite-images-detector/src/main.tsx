import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Detector from './detector/ui/Detector.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Detector></Detector>
  </StrictMode>,
)
