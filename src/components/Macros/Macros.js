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
  const {
    Editor,
    toJSON,
    actions,
  } = useMacros()

  return (
    <MacrosWrapper>
      {Object.entries(actions).map(([name, action]) => (
        <ActionButton
          onClick={() =>
            action({
              provider: 'Bob',
              mention: '{{isuruncle}}',
            })
          }
        >
          {name}
        </ActionButton>
      ))}
      <EditorWrapper>
        <Editor
          // plugins={plugins} // TODO bring back later
          blockRendererFn={blockRenderer}
        />
      </EditorWrapper>
      <h3>ContentState</h3>
      <DebugWrapper>
        <Code>{toJSON()}</Code>
      </DebugWrapper>
    </MacrosWrapper>
  )
}
