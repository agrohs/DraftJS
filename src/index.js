import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from '@zendeskgarden/react-theming'

import { App } from './App'

import './base.css'

const ThemedApp = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
)

const rootElement = document.getElementById('root')
ReactDOM.render(<ThemedApp />, rootElement)
