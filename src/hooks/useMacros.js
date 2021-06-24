import React, { useState, useMemo, useCallback, useEffect, useLayoutEffect } from 'react'
import {
  AtomicBlockUtils,
  convertToRaw,
  EditorState,
  RichUtils,
} from 'draft-js'
import createMentionPlugin from '@draft-js-plugins/mention'

import { blockRenderer } from '../utils/render'
import { ensureArray, lowercase } from '../utils/display'
import { MentionSuggestion } from '../components'
// import { MacroTextReplacement, MentionSuggestion } from '../components'
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

  // const wrappedInsertBlock = useCallback((data) => (
  //   insertBlock(data)
  // ), [editorState])

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
      mentionComponent: ({ children, entityKey, mention, decoratedText, ...foo }) => {
        // console.log(`>>> > mention`, mention)
        // console.log(`>>> > Foo > foo`, foo)
        // console.log(`>>> > Foo > decoratedText`, decoratedText)
        // console.log(`>>> > Foo > entityKey`, entityKey)
    
        // useLayoutEffect(() => {
        //   wrappedInsertBlock({
        //     provider: 'Bob',
        //     mention: decoratedText,
        //   })
        // }, [])
    
        return (children)
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
      // plugins: [decoratorPlugin, mentionPlugin],
      plugins: [mentionPlugin],
      addOns: [MacroMentions],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useEffect(() => {
  //   ensureArray(plugins).forEach((plugin) => {
  //     if (plugin.store) {
  //       plugin.store.setEditorState(editorState)
  //     }
  //   })
  // }, [editorState, plugins])

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

  const insertBlock = (data) => {
    const { mention: text = ' ' } = data
    console.log(`>>> > insertBlock > text`, text)
    const contentState = editorState.getCurrentContent()
    // const bar = contentState.getPlainText()
    // console.log(`>>> > insertBlock > bar`, bar)

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
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, text),
    )
  }

  //#endregion ACTIONS

  const addOnProps = {
    mentions: filteredMentions,
    mentionsOpen,
    onChange: handleSearchChange,
    onOpen: setMentionsOpen,
    // onAddMention: ({ name }) => {
    //   console.log('onAddMention', name)
    //   insertBlock({
    //     provider: 'Bob',
    //     mention: name,
    //   })
    // }
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
