import { Map } from 'immutable';
import React from 'react';
import Mention from './Mention';
import MentionSuggestions from './MentionSuggestions/MentionSuggestions'; // eslint-disable-line import/no-named-as-default
import MentionSuggestionsPortal from './MentionSuggestionsPortal';
import addMention from './modifiers/addMention';
import defaultRegExp from './defaultRegExp';
import { defaultTheme } from './theme';
import mentionStrategy from './mentionStrategy';
import mentionSuggestionsStrategy from './mentionSuggestionsStrategy';
import suggestionsFilter from './utils/defaultSuggestionsFilter';

export { default as MentionSuggestions } from './MentionSuggestions/MentionSuggestions';

export { defaultTheme };
export { addMention };

export default (config = {}) => {
  const callbacks = {
    keyBindingFn: undefined,
    handleKeyCommand: undefined,
    handleReturn: undefined,
    onChange: undefined,
  };

  const ariaProps = {
    ariaHasPopup: 'false',
    ariaExpanded: false,
    ariaOwneeID: undefined,
    ariaActiveDescendantID: undefined,
  };

  let searches = Map();
  let escapedSearch;
  let clientRectFunctions = Map();
  let isOpened = false;
  let referenceElement;

  const store = {
    getEditorState: undefined,
    setEditorState: undefined,
    getPortalClientRect: (offsetKey) => clientRectFunctions.get(offsetKey)(),
    getAllSearches: () => searches,
    isEscaped: (offsetKey) => escapedSearch === offsetKey,
    escapeSearch: (offsetKey) => {
      escapedSearch = offsetKey;
    },

    resetEscapedSearch: () => {
      escapedSearch = undefined;
    },

    register: (offsetKey) => {
      searches = searches.set(offsetKey, offsetKey);
    },

    updatePortalClientRect: (offsetKey, func) => {
      clientRectFunctions = clientRectFunctions.set(offsetKey, func);
    },

    unregister: (offsetKey) => {
      searches = searches.delete(offsetKey);
      clientRectFunctions = clientRectFunctions.delete(offsetKey);
    },

    getIsOpened: () => isOpened,
    setIsOpened: (nextIsOpened) => {
      isOpened = nextIsOpened;
    },

    getReferenceElement: () => referenceElement,
    setReferenceElement: (element) => {
      referenceElement = element;
    },
  };

  // Styles are overwritten instead of merged as merging causes a lot of confusion.
  //
  // Why? Because when merging a developer needs to know all of the underlying
  // styles which needs a deep dive into the code. Merging also makes it prone to
  // errors when upgrading as basically every styling change would become a major
  // breaking change. 1px of an increased padding can break a whole layout.
  const {
    mentionPrefix = '',
    theme = defaultTheme,
    positionSuggestions,
    mentionComponent,
    mentionSuggestionsComponent: MentionSuggestionsComponent = MentionSuggestions,
    entityMutability = 'SEGMENTED',
    mentionTrigger = '@',
    mentionRegExp = defaultRegExp,
    supportWhitespace = false,
    popperOptions,
  } = config;
  const mentionTriggers =
    typeof mentionTrigger === 'string' ? [mentionTrigger] : mentionTrigger;
  const mentionSearchProps = {
    ariaProps,
    callbacks,
    theme,
    store,
    entityMutability,
    positionSuggestions,
    mentionTriggers,
    mentionPrefix,
    popperOptions,
  };
  const DecoratedMentionSuggestionsComponent = (props) => (
    <MentionSuggestionsComponent {...props} {...mentionSearchProps} />
  );
  const DecoratedMention = (props) => (
    <Mention {...props} theme={theme} mentionComponent={mentionComponent} />
  );
  const DecoratedMentionSuggestionsPortal = (props) => (
    <MentionSuggestionsPortal {...props} store={store} />
  );
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
      store.getEditorState = getEditorState;
      store.setEditorState = setEditorState;
    },

    keyBindingFn: (keyboardEvent) =>
      callbacks.keyBindingFn && callbacks.keyBindingFn(keyboardEvent),
    handleReturn: (keyboardEvent) =>
      callbacks.handleReturn && callbacks.handleReturn(keyboardEvent),
    onChange: (editorState) => {
      if (callbacks.onChange) {
        return callbacks.onChange(editorState);
      }
      return editorState;
    },
  };
};

export const defaultSuggestionsFilter = suggestionsFilter;