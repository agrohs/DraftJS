import React, { useEffect, useRef } from 'react'

import { ensureObject } from '../../utils/display'
import { Suggestion } from './MacroMentionSuggestion.style'

const MentionSuggestion = (props) => {
  const { mention: { title } = {}, isFocused, ...parentProps } = ensureObject(
    props,
  )

  const entryRef = useRef(null)

  // NOTE: this useEffect is to keep the mentions scrolling through the list when keys are used to navigate
  useEffect(() => {
    if (
      isFocused &&
      entryRef &&
      entryRef.current &&
      entryRef.current.parentElement &&
      entryRef.current.scrollIntoView
    ) {
      entryRef.current.scrollIntoView({
        block: 'nearest',
        inline: 'center',
        behavior: 'auto',
      })
    }
  }, [isFocused])

  return (
    <Suggestion ref={entryRef} isFocused={isFocused} {...parentProps}>
      {title}
    </Suggestion>
  )
}

export default MentionSuggestion
