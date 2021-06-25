import React, { useState, useMemo, useLayoutEffect } from 'react'
import {
  AtomicBlockUtils,
  convertToRaw,
  EditorState,
  RichUtils,
} from 'draft-js'
// import createMentionPlugin from '@draft-js-plugins/mention'

import createMentionPlugin from '../utils/mentions'
import { blockRenderer } from '../utils/render'
import { ensureArray, lowercase } from '../utils/display'
import { MentionSuggestion } from '../components'
import {
  SAMPLE_MENTIONS,
} from '../utils/mentions/constants'

export default () => {
  const [filteredMentions, setFilteredMentions] = useState(SAMPLE_MENTIONS)
  const [mentionsOpen, setMentionsOpen] = useState(false)
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  )

  const { addOns, plugins } = useMemo(() => {
    const mentionPlugin = createMentionPlugin({
      mentionComponent: ({ decoratedText, editorState: _editorState }) => {    
        useLayoutEffect(() => {
          insertBlock({
            provider: 'Bob',
            mention: decoratedText,
          }, _editorState)
        }, [])
    
        return (<span style={{ display: 'none' }}>children</span>)
      },
    })

    const { MentionSuggestions } = mentionPlugin

    const MacroMentions = ({
      mentions,
      mentionsOpen,
      onOpen,
      onChange,
      ...renderProps
    }) => (
      <MentionSuggestions
        entryComponent={MentionSuggestion}
        suggestions={mentions}
        open={mentionsOpen}
        onOpenChange={onOpen}
        onSearchChange={onChange}
        {...renderProps}
      />
    )

    return {
      plugins: [mentionPlugin],
      addOns: [MacroMentions],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toJSON = () => {
    const contentState = editorState.getCurrentContent()
    return JSON.stringify(convertToRaw(contentState), null, 2)
  }

  const toText = () => {
    const contentState = editorState.getCurrentContent()
    return contentState.getPlainText()
  }

  // TODO do we need this?
  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)

    if (newState) {
      setEditorState(newState)
      return 'handled'
    }

    return 'not-handled'
  }

  const handleSearchChange = ({ value }) => {
    setFilteredMentions(
      ensureArray(SAMPLE_MENTIONS).filter(({ name }) =>
        lowercase(name).includes(lowercase(value)),
      ),
    )
  }

  //#region ACTIONS

  const insertBlock = (data, _editorState) => {
    const { mention: text = ' ' } = data
    const currentEditorState = _editorState || editorState
    const contentState = currentEditorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
      'LINK', // NOTE: still no clue what this does, but think it will be important!
      'IMMUTABLE',
      data,
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(currentEditorState, {
      currentContent: contentStateWithEntity,
    })

    setEditorState(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, text),
    )
  }

  //#endregion ACTIONS

  const addOnProps = {
    mentions: filteredMentions,
    mentionsOpen,
    onChange: handleSearchChange,
    onOpen: setMentionsOpen,
  }

  const editorProps = {
    plugins,
    addOns,
    addOnProps,
    editorState,
    handleKeyCommand,
    blockRendererFn: blockRenderer,
    onChange: setEditorState,
  }

  return {
    toText,
    toJSON,
    editorProps,
    actions: {
      insertBlock,
    },
  }
}
