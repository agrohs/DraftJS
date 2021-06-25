import styled from 'styled-components'

export const BlockWrapper = styled.span`
  margin: 0 1px;

  && > * {
    cursor: pointer;
    user-select: none;
  }
`
