import styled from 'styled-components'

export const BlockWrapper = styled.span.attrs(() => ({
  editable: false,
}))`
  ${({ theme: { space } }) => `
    margin: 0 1px;

    && > * {
      cursor: pointer;
      user-select: none;
    }
  `}
`
