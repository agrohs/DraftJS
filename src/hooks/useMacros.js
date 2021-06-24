import React, { useState, useMemo } from 'react'
import {
  AtomicBlockUtils,
  convertToRaw,
  EditorState,
  RichUtils,
} from 'draft-js'
import createMentionPlugin from '@draft-js-plugins/mention'

import { blockRenderer } from '../utils/render'
import { ensureArray, lowercase } from '../utils/display'
import { MacroTextReplacement, MacroMentionSuggestion } from '../components'
import {
  SAMPLE_REPLACEMENTS,
  SAMPLE_MENTIONS,
  RICH_TEXT_EDITOR_MENTION_REGEX,
} from '../utils/mentions'

// const findWithRegex = (regex, contentBlock, callback) => {
//   const text = contentBlock.getText()
//   let matchArr
//   let start
//   let end

//   while ((matchArr = regex.exec(text)) !== null) {
//     start = matchArr.index
//     end = start + matchArr[0].length
//     callback(start, end)
//   }
// }

export default () => {
  const [filteredMentions, setFilteredMentions] = useState(SAMPLE_MENTIONS)
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
    //           SAMPLE_REPLACEMENTS={SAMPLE_REPLACEMENTS}
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

    const MacroMentions = ({
      mentions,
      mentionsOpen,
      onOpen,
      onChange,
      ...renderProps
    }) => (
      <MentionSuggestions
        entryComponent={MacroMentionSuggestion}
        suggestions={mentions}
        open={mentionsOpen}
        onOpenChange={onOpen}
        onSearchChange={onChange}
        {...renderProps}
      />
    )

    return {
      // plugins: [decoratorPlugin, mentionPlugin],
      plugins: [mentionPlugin],
      addOns: [MacroMentions],
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
      ensureArray(SAMPLE_MENTIONS).filter(({ name }) =>
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
    toJSON,
    editorProps,
    actions: {
      insertBlock,
    },
  }
}
