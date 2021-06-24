import React from 'react'

import { useMacros } from '../../hooks'
import { blockRenderer } from '../../utils/render'
import {
  MacrosWrapper,
  EditorWrapper,
  ActionButton,
  DebugWrapper,
  Code,
} from './Macros.style'

export default () => {
  const { insertBlock, contentAsJSON, Editor } = useMacros()

  return (
    <MacrosWrapper>
      <ActionButton
        onClick={() =>
          insertBlock({
            provider: 'Bob',
            mention: '{{isuruncle}}',
          })
        }
      >
        Insert block
      </ActionButton>
      <EditorWrapper>
        <Editor
          // plugins={plugins} // TODO bring back later
          blockRendererFn={blockRenderer}
        />
      </EditorWrapper>
      <h3>ContentState</h3>
      <DebugWrapper>
        <Code>{contentAsJSON()}</Code>
      </DebugWrapper>
    </MacrosWrapper>
  )
}
