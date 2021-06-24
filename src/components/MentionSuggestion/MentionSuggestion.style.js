import styled from 'styled-components'
import {
  zdSpacingXxs,
  zdSpacingXs,
  zdColorGrey200,
  zdColorBlue100,
  zdColorBlue200,
  zdColorWhite,
  zdFontSizeSm,
} from '@zendeskgarden/css-variables'

export const Suggestion = styled.div`
  width: 100%;
  padding: ${zdSpacingXxs} ${zdSpacingXs};
  border-bottom: 1px solid
    ${({ isFocused }) => (isFocused ? zdColorBlue200 : zdColorGrey200)};
  background-color: ${({ isFocused }) =>
    isFocused ? zdColorBlue100 : zdColorWhite};
  font-size: ${zdFontSizeSm};
  transition: background-color 400ms linear;
`
