import React from 'react'

// import Editor from '@draft-js-plugins/editor'

import { useMacros } from '../../hooks'
import {
  MacrosWrapper,
  EditorWrapper,
  ActionButton,
  DebugWrapper,
  Code,
} from './Macros.style'

import MacroEditor from '../MacroEditor/MacroEditor'

export default () => {
  const {
    actions,
    editorProps,
    toJSON,
  } = useMacros()

  return (
    <MacrosWrapper>
      {Object.entries(actions).map(([name, action]) => (
        <ActionButton
          key={name}
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
        <MacroEditor {...editorProps} />
      </EditorWrapper>
      <h3>ContentState</h3>
      <DebugWrapper>
        <Code>{toJSON()}</Code>
      </DebugWrapper>
    </MacrosWrapper>
  )
}
