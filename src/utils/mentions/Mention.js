import React from 'react';

const Mention = ({
  entityKey,
  mentionComponent: Component,
  children,
  decoratedText,
  contentState,
  getEditorState,
}) => (
  <Component
    entityKey={entityKey}
    mention={contentState.getEntity(entityKey).getData().mention}
    decoratedText={decoratedText}
    editorState={getEditorState()}
  >
    {children}
  </Component>
)

export default Mention
