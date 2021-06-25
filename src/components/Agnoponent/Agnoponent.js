import React from 'react'

import { Tag } from '@zendeskgarden/react-tags'

import { BlockWrapper } from './Agnoponent.style'

export default ({ mention, provider, ...renderProps }) => (
  <BlockWrapper {...renderProps}>
    <Tag>
      <span data-provider={provider}>
        {mention}
      </span>
    </Tag>
  </BlockWrapper>
)
