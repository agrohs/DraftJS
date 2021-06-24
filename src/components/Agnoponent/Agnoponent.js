import React from 'react'

import { BlockWrapper } from './Agnoponent.style'

export default ({ blockProps, block, contentState }) => {
  const entity = block.getEntityAt(0)

  if (!entity) {
    return null
  }

  const { provider, mention } = contentState.getEntity(entity).getData()

  return (
    <BlockWrapper editable="false" {...blockProps}>
      <b>{provider}</b>
      <span>{mention}</span>
    </BlockWrapper>
  )
}
