import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import NewsApp from './NewsApp'

const root = createRoot(document.getElementById('root'))

root.render(
  <StrictMode>
    <NewsApp />
  </StrictMode>
)

// Dismiss the loading screen once React has mounted
if (window.__briefLoaded) {
  window.__briefLoaded()
}
