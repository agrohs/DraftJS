import React, { useState } from 'react'
import { render } from 'react-dom'
import classNames from 'classnames'

import './styles.css'

import { Editor, EditorState, AtomicBlockUtils } from 'draft-js'

const Agnoponent = ({ blockProps, block, contentState }) => {
  const entity = block.getEntityAt(0)

  if (!entity) {
    return null
  }

  const { provider, mention } = contentState.getEntity(entity).getData()

  return (
    <span editable="false" {...blockProps}>
      <b>{provider}</b>
      <span>{mention}</span>
    </span>
  )
}

const blockRenderer = (block) => {
  const type = block.getType()
  console.log('block', block)
  if (type === 'atomic') {
    return {
      component: Agnoponent,
      editable: false,
      props: {
        className: classNames('inline', 'blue'),
      },
    }
  }
  return null
}

const App = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  )

  const insertBlock = (data) => {
    const contentState = editorState.getCurrentContent()

    const contentStateWithEntity = contentState.createEntity(
      'TOKEN',
      'IMMUTABLE',
      data,
    )

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })

    setEditorState(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '),
    )
  }

  return (
    <div>
      <button
        onClick={() =>
          insertBlock({
            provider: 'Magento',
            mention: '{{bobn}}',
          })
        }
      >
        Insert block
      </button>
      <Editor
        spellCheck
        // plugins={plugins} // TODO bring back later
        editorState={editorState}
        onChange={setEditorState}
        blockRendererFn={blockRenderer}
      />
    </div>
  )
}

render(<App />, document.getElementById('root'))
