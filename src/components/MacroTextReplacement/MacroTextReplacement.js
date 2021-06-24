import React, { useLayoutEffect } from 'react'

export default ({
  setMentionsOpen = () => {},
  children = null,
}) => {
  useLayoutEffect(() => {
    setMentionsOpen(false)
  }, [setMentionsOpen])

  return children
}
