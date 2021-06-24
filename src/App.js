import React from 'react'
import { ThemeProvider } from '@zendeskgarden/react-theming'

import { Macros } from './components'

import './base.css'

export const App = () => (
  <ThemeProvider>
    <Macros />
  </ThemeProvider>
)
