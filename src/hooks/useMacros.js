import React, { useState, useMemo } from 'react'
import {
  AtomicBlockUtils,
  convertToRaw,
  Editor,
  EditorState,
  RichUtils,
} from 'draft-js'
import createMentionPlugin from '@draft-js-plugins/mention'

import { MacroMentionSuggestion } from '../components/MacroMentionSuggestion/MacroMentionSuggestion'
import { MacroTextReplacement } from '../components/MacroTextReplacement/MacroTextReplacement'
import { ensureArray, lowercase } from '../utils/display'

// TODO: look for possible alternatives/better implementations
const RICH_TEXT_EDITOR_MENTION_REGEX = [
  '[',
  '\\w-',
  // Latin-1 Supplement (letters only) - https://en.wikipedia.org/wiki/List_of_Unicode_characters#Latin-1_Supplement
  '\u00C0-\u00D6',
  '\u00D8-\u00F6',
  '\u00F8-\u00FF',
  // Latin Extended-A (without deprecated character) - https://en.wikipedia.org/wiki/List_of_Unicode_characters#Latin_Extended-A
  '\u0100-\u0148',
  '\u014A-\u017F',
  // Cyrillic symbols: \u0410-\u044F - https://en.wikipedia.org/wiki/Cyrillic_script_in_Unicode
  '\u0410-\u044F',
  // hiragana (japanese): \u3040-\u309F - https://gist.github.com/ryanmcgrath/982242#file-japaneseregex-js
  '\u3040-\u309F',
  // katakana (japanese): \u30A0-\u30FF - https://gist.github.com/ryanmcgrath/982242#file-japaneseregex-js
  '\u30A0-\u30FF',
  // For an advanced explaination about Hangul see https://github.com/draft-js-plugins/draft-js-plugins/pull/480#issuecomment-254055437
  // Hangul Jamo (korean): \u3130-\u318F - https://en.wikipedia.org/wiki/Korean_language_and_computers#Hangul_in_Unicode
  // Hangul Syllables (korean): \uAC00-\uD7A3 - https://en.wikipedia.org/wiki/Korean_language_and_computers#Hangul_in_Unicode
  '\u3130-\u318F',
  '\uAC00-\uD7A3',
  // common chinese symbols: \u4e00-\u9eff - http://stackoverflow.com/a/1366113/837709
  '\u4e00-\u9eff',
  // custom symbols: `@`, `.`
  '\u0040',
  '\u002E',
  ']',
].join('')

const mentions = [
  { name: '{{order.date}}', title: 'order.date' },
  { name: '{{order.total}}', title: 'order.total' },
  { name: '{{order.status}}', title: 'order.status' },
  { name: '{{payment.status}}', title: 'payment.status' },
  { name: '{{shipping.status}}', title: 'shipping.status' },
]

const replacements = {
  order: {
    date: 'Jun 23, 2021',
    total: '$400',
    status: 'complete',
  },
  payment: {
    status: 'paid',
  },
  shipping: {
    status: 'shipped',
  },
}

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
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  )
  const [mentionsOpen, setMentionsOpen] = useState(false)

  const { MentionSuggestions, plugins } = useMemo(() => {
    const decoratorPlugin = {
      decorators: [
        {
          strategy: (contentBlock, callback) => {
            findWithRegex(
              new RegExp(/\{{[^{}}]*\}}/, 'g'),
              contentBlock,
              callback,
            )
          },
          component: (props) => (
            <MacroTextReplacement
              replacements={replacements}
              setMentionsOpen={setMentionsOpen}
              {...props}
            />
          ),
        },
      ],
    }
    const mentionPlugin = createMentionPlugin({
      mentionTrigger: ['{{'],
      // TODO: optimize the regex
      mentionRegExp: RICH_TEXT_EDITOR_MENTION_REGEX,
      entityMutability: 'IMMUTABLE',
    })
    const { MentionSuggestions: _MentionSuggestions } = mentionPlugin
    return {
      plugins: [decoratorPlugin, mentionPlugin],
      MentionSuggestions: _MentionSuggestions,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [filteredMentions, setFilteredMentions] = useState(mentions)
  console.log(filteredMentions)
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

  const AgnoEditor = (props) => (
    <div>
      <Editor
        spellCheck
        plugins={plugins}
        editorState={editorState}
        onChange={setEditorState}
        handleKeyCommand={handleKeyCommand}
        {...props}
      />
      <MentionSuggestions
        open={mentionsOpen}
        suggestions={filteredMentions}
        entryComponent={MacroMentionSuggestion}
        onOpenChange={setMentionsOpen}
        onSearchChange={handleSearchChange}
      />
    </div>
  )

  return {
    editorState,
    setEditorState,
    insertBlock,
    contentAsJSON,
    Editor: AgnoEditor,
  }
}
