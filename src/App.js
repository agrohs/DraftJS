import React from 'react'
import { Macros } from './components'
import { ThemeProvider } from '@zendeskgarden/react-theming'

import './base.css'

export const App = () => (
  <ThemeProvider>
    <Macros />
  </ThemeProvider>
)
