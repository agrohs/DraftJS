import React from 'react'
import Editor from '@draft-js-plugins/editor'

export default ({ children, addOns, addOnProps, ...editorProps }) => (
  <div>
    <Editor spellCheck {...editorProps} />
    {addOns.map((AddOn, index) => (
      <AddOn key={`add-on-${index}`} {...addOnProps} />
    ))}
    {children}
  </div>
)
