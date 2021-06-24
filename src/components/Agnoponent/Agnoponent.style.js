import styled from 'styled-components'

import { zdColorWhite, zdColorGrey700 } from '@zendeskgarden/css-variables'

export const BlockWrapper = styled.span.attrs(() => ({
  editable: false,
}))`
  cursor: pointer;
  user-select: none;
  background-color: ${zdColorGrey700};
  color: ${zdColorWhite};
  margin: 0 1px;
  padding: 0 4px;
  border-radius: 4px;
`
