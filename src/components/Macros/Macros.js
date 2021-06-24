import React from 'react'

import { Button } from '@zendeskgarden/react-buttons'

import { useMacros } from '../../hooks'
import { blockRenderer } from '../../utils/render'
import { MacrosWrapper, EditorWrapper } from './Macros.style'

export default () => {
  const { insertBlock, contentAsJSON, Editor } = useMacros()

  return (
    <MacrosWrapper>
      <Button
        onClick={() =>
          insertBlock({
            provider: 'Bob',
            mention: '{{isuruncle}}',
          })
        }
      >
        Insert block
      </Button>
      <EditorWrapper>
        <Editor
          // plugins={plugins} // TODO bring back later
          blockRendererFn={blockRenderer}
        />
      </EditorWrapper>
      <h3>ContentState</h3>
      <pre id="raw-display">{contentAsJSON()}</pre>
    </MacrosWrapper>
  )
}
