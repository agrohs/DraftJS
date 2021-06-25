import { Map } from 'immutable'
import React from 'react'

// import Mention from './Mention'
// import MentionSuggestions from './MentionSuggestions/MentionSuggestions' // eslint-disable-line import/no-named-as-default
import MentionSuggestionsPortal from './MentionSuggestionsPortal'

import {
  Mention,
  MentionSuggestions,
} from './components'

import addMention from './modifiers/addMention'
import mentionStrategy from './mentionStrategy'
import mentionSuggestionsStrategy from './mentionSuggestionsStrategy'
import suggestionsFilter from './utils/defaultSuggestionsFilter'
import {
  // SAMPLE_REPLACEMENTS,
  // SAMPLE_MENTIONS,
  RICH_TEXT_EDITOR_MENTION_REGEX,
} from './constants'

export { default as MentionSuggestions } from './components/MentionSuggestions'
export { addMention }

const callbacks = {
  keyBindingFn: undefined,
  handleKeyCommand: undefined,
  handleReturn: undefined,
  onChange: undefined,
}

const ariaProps = {
  ariaHasPopup: 'false',
  ariaExpanded: false,
  ariaOwneeID: undefined,
  ariaActiveDescendantID: undefined,
}

const createPlugin = (config = {}) => {
  let searches = Map()
  let escapedSearch
  let clientRectFunctions = Map()
  let isOpened = false
  let referenceElement

  const entityMutability = 'IMMUTABLE'
  const mentionRegExp = RICH_TEXT_EDITOR_MENTION_REGEX
  const supportWhitespace = false
  const mentionTriggers = ['{{']
  const mentionPrefix = ''

  const { mentionComponent } = config

  const store = {
    getEditorState: undefined,
    setEditorState: undefined,
    getPortalClientRect: (offsetKey) => clientRectFunctions.get(offsetKey)(),
    getAllSearches: () => searches,
    isEscaped: (offsetKey) => escapedSearch === offsetKey,
    escapeSearch: (offsetKey) => {
      escapedSearch = offsetKey
    },
    resetEscapedSearch: () => {
      escapedSearch = undefined
    },
    register: (offsetKey) => {
      searches = searches.set(offsetKey, offsetKey)
    },
    updatePortalClientRect: (offsetKey, func) => {
      clientRectFunctions = clientRectFunctions.set(offsetKey, func)
    },
    unregister: (offsetKey) => {
      searches = searches.delete(offsetKey)
      clientRectFunctions = clientRectFunctions.delete(offsetKey)
    },
    getIsOpened: () => isOpened,
    setIsOpened: (nextIsOpened) => {
      isOpened = nextIsOpened
    },
    getReferenceElement: () => referenceElement,
    setReferenceElement: (element) => {
      referenceElement = element
    },
  }

  const mentionSearchProps = {
    ariaProps,
    callbacks,
    store,
    entityMutability,
    positionSuggestions: null,
    mentionTriggers,
    mentionPrefix,
    popperOptions: {},
  }

  const DecoratedMentionSuggestionsComponent = (props) => (
    <MentionSuggestions {...props} {...mentionSearchProps} />
  )

  const DecoratedMention = (props) => (
    <Mention mentionComponent={mentionComponent} {...props} />
  )

  const DecoratedMentionSuggestionsPortal = (props) => (
    <MentionSuggestionsPortal store={store} {...props} />
  )

  return {
    MentionSuggestions: DecoratedMentionSuggestionsComponent,
    decorators: [
      {
        strategy: mentionStrategy(mentionTriggers),
        component: DecoratedMention,
      },
      {
        strategy: mentionSuggestionsStrategy(
          mentionTriggers,
          supportWhitespace,
          mentionRegExp
        ),
        component: DecoratedMentionSuggestionsPortal,
      },
    ],
    getAccessibilityProps: () => ({
      role: 'combobox',
      ariaAutoComplete: 'list',
      ariaHasPopup: ariaProps.ariaHasPopup,
      ariaExpanded: ariaProps.ariaExpanded,
      ariaActiveDescendantID: ariaProps.ariaActiveDescendantID,
      ariaOwneeID: ariaProps.ariaOwneeID,
    }),
    initialize: ({ getEditorState, setEditorState }) => {
      store.getEditorState = getEditorState
      store.setEditorState = setEditorState
    },
    keyBindingFn: (keyboardEvent) =>
      callbacks.keyBindingFn && callbacks.keyBindingFn(keyboardEvent),
    handleReturn: (keyboardEvent) =>
      callbacks.handleReturn && callbacks.handleReturn(keyboardEvent),
    onChange: (editorState) => {
      if (callbacks.onChange) {
        return callbacks.onChange(editorState)
      }
      return editorState
    },
  }
}

export default createPlugin

export const defaultSuggestionsFilter = suggestionsFilter