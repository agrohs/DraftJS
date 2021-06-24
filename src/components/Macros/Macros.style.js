import styled from 'styled-components'
import { zdColorGrey400, zdColorGrey200 } from '@zendeskgarden/css-variables'

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

export const EditorWrapper = styled.div`
  border: 1px solid ${zdColorGrey400};
  background-color: ${zdColorGrey200};
`
