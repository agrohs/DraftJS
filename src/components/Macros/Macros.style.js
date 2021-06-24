import styled from 'styled-components'

import { Well } from '@zendeskgarden/react-notifications'

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
