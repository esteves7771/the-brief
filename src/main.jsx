import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import NewsApp from './NewsApp'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NewsApp />
  </StrictMode>
)