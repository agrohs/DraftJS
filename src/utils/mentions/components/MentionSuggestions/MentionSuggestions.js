import React, { useLayoutEffect, useEffect, useState } from 'react'
import { genKey } from 'draft-js'

import Entry from './Entry/Entry'
import addMention from '../../modifiers/addMention'
import getSearchText from '../../utils/getSearchText'
import defaultEntryComponent from './Entry/DefaultEntryComponent'
import defaultPositionSuggestions from '../../utils/positionSuggestions'
import getTriggerForMention from '../../utils/getTriggerForMention'
import Popover from './Popover'
import { warning } from '../../utils/warning'

const MentionSuggestions = (props) => {
  const {
    ariaProps,
    callbacks,
    entryComponent,
    entityMutability,
    mentionPrefix,
    mentionTriggers,
    onAddMention,
    onOpenChange = () => {},
    onSearchChange = () => {},
    open,
    popoverComponent,
    popoverContainer: PopoverContainer = Popover,
    popperOptions,
    positionSuggestions,
    renderEmptyPopup,
    suggestions,
    store,
    ...elementProps,
  } = props;

  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0)

  const {
    getAllSearches,
    escapeSearch,
    getEditorState,
    setEditorState,
    resetEscapedSearch,
    isEscaped,
    getIsOpened,
    getPortalClientRect,
  } = store

  const key = genKey()
  let popover
  let activeOffsetKey
  let lastSearchValue
  let lastActiveTrigger = ''

  const handleEditorStateChange = (editorState) => {
    console.log('editorState:', editorState)
    const searches = getAllSearches()

    if (searches.size === 0) {
      return editorState
    }

    const removeList = () => {
      resetEscapedSearch()
      handleCloseDropdown()

      return editorState
    }

    const triggerForMention = getTriggerForMention(
      editorState,
      searches,
      mentionTriggers
    )

    if (!triggerForMention) {
      return removeList()
    }

    const lastActiveOffsetKey = activeOffsetKey
    activeOffsetKey = triggerForMention.activeOffsetKey

    handleSearchChange(
      editorState,
      editorState.getSelection(),
      activeOffsetKey,
      lastActiveOffsetKey,
      triggerForMention.activeTrigger
    )

    // make sure the escaped search is reseted in the cursor since the user
    // already switched to another mention search
    if (!isEscaped(activeOffsetKey || '')) {
      resetEscapedSearch()
    }

    // If none of the above triggered to close the window, it's safe to assume
    // the dropdown should be open. This is useful when a user focuses on another
    // input field and then comes back: the dropdown will show again.
    if (!open && !isEscaped(activeOffsetKey || '')) {
      handleOpenDropdown();
    }

    // makes sure the focused index is reseted every time a new selection opens
    // or the selection was moved to another mention search
    if (lastActiveOffsetKey !== activeOffsetKey) {
      setFocusedOptionIndex(0)
    }

    return editorState
  }

  const handleSearchChange = ({
    editorState,
    selection,
    activeOffsetKey,
    lastActiveOffsetKey,
    trigger,
  }) => {
    const { matchingString: searchValue } = getSearchText(
      editorState,
      selection,
      [trigger]
    )

    if (
      lastActiveTrigger !== trigger ||
      lastSearchValue !== searchValue ||
      activeOffsetKey !== lastActiveOffsetKey
    ) {
      lastActiveTrigger = trigger;
      lastSearchValue = searchValue;
      onSearchChange({ trigger, value: searchValue });
    }
  }

  useLayoutEffect(() => {
    callbacks.onChange = handleEditorStateChange

    return () => {
      callbacks.onChange = undefined
    }
  }, [])

  useEffect(() => {
    if (popover) {
      // In case the list shrinks there should be still an option focused.
      // Note: this might run multiple times and deduct 1 until the condition is
      // not fullfilled anymore.
      const size = suggestions.length
      if (size > 0 && focusedOptionIndex >= size) {
        setFocusedOptionIndex(size - 1)
      }

      // Note: this is a simple protection for the error when componentDidUpdate
      // try to get new getPortalClientRect, but the key already was deleted by
      // previous action. (right now, it only can happened when set the mention
      // trigger to be multi-characters which not supported anyway!)
      if (!getAllSearches().has(activeOffsetKey)) {
        return
      }

      const decoratorRect = getPortalClientRect(activeOffsetKey)
      const _positionSuggestions = positionSuggestions || defaultPositionSuggestions
      const newStyles = _positionSuggestions({ decoratorRect, props, popover })

      for (const [key, value] of Object.entries(newStyles)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (popover.style)[key] = value;
      }
    }
  }, [popover])

  // to force a re-render of the outer component to change the aria props
  const reRenderEditorState = () => {
    setEditorState(getEditorState())
  }

  const handleDownArrow = (keyboardEvent) => {
    keyboardEvent.preventDefault()

    const newIndex = focusedOptionIndex + 1
    handleMentionFocus(newIndex >= suggestions.length ? 0 : newIndex)
  }

  const handleTab = (keyboardEvent) => {
    keyboardEvent.preventDefault()

    commitSelection()
  }

  const handleUpArrow = (keyboardEvent) => {
    keyboardEvent.preventDefault()

    if (suggestions.length > 0) {
      const newIndex = focusedOptionIndex - 1
      handleMentionFocus(newIndex < 0 ? suggestions.length - 1 : newIndex)
    }
  }

  const handleEscape = (keyboardEvent) => {
    keyboardEvent.preventDefault()

    escapeSearch(activeOffsetKey || '')
    handleCloseDropdown()

    reRenderEditorState()
  }

  const handleMentionSelect = (mention) => {
    // Note: This can happen in case a user typed @xxx (invalid mention) and
    // then hit Enter. Then the mention will be undefined.
    if (!mention) {
      return
    }

    if (onAddMention) {
      onAddMention(mention)
    }

    handleCloseDropdown()

    setEditorState(
      addMention(
        getEditorState(),
        mention,
        mentionPrefix,
        lastActiveTrigger || '',
        entityMutability,
      ),
    )
  }

  const handleMentionFocus = (index) => {
    const descendant = `mention-option-${key}-${index}`
    ariaProps.ariaActiveDescendantID = descendant

    setFocusedOptionIndex(index)
    reRenderEditorState()
  }

  const commitSelection = () => {
    const mention = suggestions[focusedOptionIndex]

    if (!getIsOpened() || !mention) {
      return 'not-handled'
    }

    handleMentionSelect(mention)

    return 'handled'
  }

  const handleOpenDropdown = () => {
    // NOTE This may not be the ideal way of attaching & releasing the key related functions.
    // It assumes that the keyFunctions object will not loose its reference and
    // by this we can replace inner parameters spread over different modules.
    // This better be some registering & unregistering logic. PRs are welcome :)
    callbacks.handleReturn = commitSelection
    callbacks.keyBindingFn = (keyboardEvent) => {
      switch (keyboardEvent.keyCode) {
        // arrow down
        case 40: {
          handleDownArrow(keyboardEvent)
          break
        }

        // arrow up
        case 38: {
          handleUpArrow(keyboardEvent)
          break
        }

        // escape
        case 27: {
          handleEscape(keyboardEvent)
          break
        }

        // tab
        case 9: {
          handleTab(keyboardEvent)
          break
        }

        default: {
          return undefined
        }
      }
    }

    ariaProps.ariaActiveDescendantID = `mention-option-${key}-${focusedOptionIndex}`
    ariaProps.ariaOwneeID = `mentions-list-${key}`
    ariaProps.ariaHasPopup = 'true'
    ariaProps.ariaExpanded = true

    onOpenChange(true)
  }

  const handleCloseDropdown = () => {
    callbacks.handleReturn = undefined
    callbacks.keyBindingFn = undefined
    ariaProps.ariaHasPopup = 'false'
    ariaProps.ariaExpanded = false
    ariaProps.ariaActiveDescendantID = undefined
    ariaProps.ariaOwneeID = undefined
    onOpenChange(false)
  }

  const renderEntry = (mention, index) => {
    const {
      id: mentionId,
      name: mentionName,
    } = mention

    return (
      <Entry
        key={mentionId != null ? mentionId : mentionName}
        onMentionSelect={handleMentionSelect}
        onMentionFocus={handleMentionFocus}
        isFocused={focusedOptionIndex === index}
        mention={mention}
        index={index}
        id={`mention-option-${key}-${index}`}
        searchValue={lastSearchValue}
        entryComponent={entryComponent || defaultEntryComponent}
      />
    )
  } 

  if (!open) {
    return null
  }

  if (popoverComponent || positionSuggestions) {
    warning(
      'The properties `popoverComponent` and `positionSuggestions` are deprecated and will be removed in @draft-js-plugins/mentions 6.0 . Use `popperOptions` instead'
    )

    return React.cloneElement(
      popoverComponent || <div />,
      {
        ...elementProps,
        role: 'listbox',
        id: `mentions-list-${key}`,
        ref: (element) => {
          popover = element
        },
      },
      suggestions.map((mention, index) => (
        renderEntry(mention, index)
      ))
    );
  }

  if (!renderEmptyPopup && suggestions.length === 0) {
    return null
  }

  return  (
    <PopoverContainer
      store={store}
      popperOptions={popperOptions}
    >
      {suggestions.map((mention, index) => (
        renderEntry(mention, index)
      ))}
    </PopoverContainer>
  )
}

export default MentionSuggestions
