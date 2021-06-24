import React, { useLayoutEffect } from 'react'

const MacroTextReplacement = ({
  setMentionsOpen = () => {},
  children = null,
}) => {
  useLayoutEffect(() => {
    setMentionsOpen(false)
  }, [setMentionsOpen])

  return children
}

export default MacroTextReplacement
