import React from 'react'

import Editor from '@draft-js-plugins/editor'

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
    editorState,
    setEditorState,
    plugins,
    addOns,
    addOnProps,
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
        <div>
          <Editor
            spellCheck
            plugins={plugins}
            editorState={editorState}
            onChange={setEditorState}
            // handleKeyCommand={handleKeyCommand}
            blockRendererFn={blockRenderer}
          />
          {addOns.map((AddOn, index) => (
            <AddOn key={`add-on-${index}`} {...addOnProps} />
          ))}
        </div>
      </EditorWrapper>
      <h3>ContentState</h3>
      <DebugWrapper>
        <Code>{toJSON()}</Code>
      </DebugWrapper>
    </MacrosWrapper>
  )
}
