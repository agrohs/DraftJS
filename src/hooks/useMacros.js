import React, { useState } from 'react'
import { AtomicBlockUtils, convertToRaw, Editor, EditorState } from 'draft-js'

export default () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  )

  const insertBlock = (data) => {
    const contentState = editorState.getCurrentContent()

    const contentStateWithEntity = contentState.createEntity(
      'LINK', // NOTE: still no clue what this does, but think it will be important!
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

  const contentAsJSON = () => {
    const contentState = editorState.getCurrentContent()
    return JSON.stringify(convertToRaw(contentState), null, 2)
  }

  const AgnoEditor = (props) => (
    <Editor
      spellCheck
      // plugins={plugins} // TODO bring back later
      editorState={editorState}
      onChange={setEditorState}
      {...props}
    />
  )

  return {
    editorState,
    setEditorState,
    insertBlock,
    contentAsJSON,
    Editor: AgnoEditor,
  }
}
