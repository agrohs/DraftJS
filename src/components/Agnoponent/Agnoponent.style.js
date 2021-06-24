import styled from 'styled-components'

export const BlockWrapper = styled.span.attrs(() => ({
  editable: false,
}))`
  && {
    cursor: pointer;
    user-select: none;
  }
`
