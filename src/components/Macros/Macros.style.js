import styled from 'styled-components'

import { Well } from '@zendeskgarden/react-notifications'
import { Button } from '@zendeskgarden/react-buttons'

export const MacrosWrapper = styled.div`
  figure {
    margin: unset;
  }

  [data-contents='true'] {
    display: inline-flex;
    flex-wrap: wrap;
    align-content: flex-start;
    min-height: 200px;
  }

  [data-block='true'] {
    margin-top: 2px;
    margin-bottom: 2px;
  }
`

export const EditorWrapper = styled(Well)`
  ${({ theme: { space } }) => `
    padding: ${space.sm};  
  `}
`

export const ActionButton = styled(Button).attrs(() => ({
  size: 'small',
}))``

export const DebugWrapper = styled(EditorWrapper).attrs(() => ({
  isRecessed: true,
}))``

export const Code = styled.pre``
