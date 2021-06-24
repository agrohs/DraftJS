import React, { useState, useMemo } from 'react'
import {
  AtomicBlockUtils,
  convertToRaw,
  Editor,
  EditorState,
  RichUtils,
} from 'draft-js'
import createMentionPlugin from '@draft-js-plugins/mention'

import { ensureArray, lowercase } from '../utils/display'
import {
  mentions,
  replacements,
  RICH_TEXT_EDITOR_MENTION_REGEX,
} from '../utils/display'
import { MacroTextReplacement, MacroMentionSuggestion } from '../components'

const findWithRegex = (regex, contentBlock, callback) => {
  const text = contentBlock.getText()
  let matchArr
  let start
  let end

  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index
    end = start + matchArr[0].length
    callback(start, end)
  }
}

export default () => {
  const [filteredMentions, setFilteredMentions] = useState(mentions)
  const [mentionsOpen, setMentionsOpen] = useState(false)
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  )

  const { addOns, plugins } = useMemo(() => {
    // const decoratorPlugin = {
    //   decorators: [
    //     {
    //       strategy: (contentBlock, callback) => {
    //         findWithRegex(
    //           new RegExp(/\{{[^{}}]*\}}/, 'g'),
    //           contentBlock,
    //           callback,
    //         )
    //       },
    //       component: (props) => (
    //         <MacroTextReplacement
    //           replacements={replacements}
    //           setMentionsOpen={setMentionsOpen}
    //           {...props}
    //         />
    //       ),
    //     },
    //   ],
    // }
    const mentionPlugin = createMentionPlugin({
      mentionTrigger: ['{{'],
      // TODO: optimize the regex?
      mentionRegExp: RICH_TEXT_EDITOR_MENTION_REGEX,
      entityMutability: 'IMMUTABLE',
    })

    const { MentionSuggestions } = mentionPlugin

    const _addOns = (
      <MentionSuggestions
        open={mentionsOpen}
        suggestions={filteredMentions}
        entryComponent={MacroMentionSuggestion}
        onOpenChange={setMentionsOpen}
        onSearchChange={handleSearchChange}
      />
    )

    return {
      plugins: [mentionPlugin],
      // plugins: [decoratorPlugin, mentionPlugin],
      addOns: _addOns,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toJSON = () => {
    const contentState = editorState.getCurrentContent()
    return JSON.stringify(convertToRaw(contentState), null, 2)
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
      ensureArray(mentions).filter(({ name }) =>
        lowercase(name).includes(lowercase(value)),
      ),
    )
  }

  //#region ACTIONS

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

  //#endregion ACTIONS

  const RTEEditor = ({ children, ...editorProps }) => (
    <div>
      <Editor
        spellCheck
        plugins={plugins}
        editorState={editorState}
        onChange={setEditorState}
        handleKeyCommand={handleKeyCommand}
        {...editorProps}
      />
      {addOns}
      {children}
    </div>
  )

  return {
    toJSON,
    actions: {
      insertBlock,
    },
    Editor: RTEEditor,
  }
}
