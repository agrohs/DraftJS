import React from 'react'

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
  const { actions, editorProps, toJSON, toText } = useMacros()

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
        {toText()}
      </DebugWrapper>
      <DebugWrapper>
        <Code>{toJSON()}</Code>
      </DebugWrapper>
    </MacrosWrapper>
  )
}
