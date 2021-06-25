import React from 'react';
import clsx from 'clsx';

function MentionLink({
  mention,
  children,
  className,
}) {
  return (
    <a
      href={mention.link}
      className={className}
      spellCheck={false}
      data-testid="mentionLink"
    >
      {children}
    </a>
  );
}

function MentionText({
  children,
  className,
}) {
  return (
    <span className={className} spellCheck={false} data-testid="mentionText">
      {children}
    </span>
  );
}

export default function Mention(props) {
  const {
    entityKey,
    theme = {},
    mentionComponent,
    children,
    decoratedText,
    className,
    contentState,
    getEditorState,
  } = props;
  console.log('props:', props)

  const combinedClassName = clsx(theme.mention, className);
  const mention = contentState.getEntity(entityKey).getData().mention;

  const Component =
    mentionComponent || (mention.link ? MentionLink : MentionText);

  return (
    <Component
      entityKey={entityKey}
      mention={mention}
      theme={theme}
      className={combinedClassName}
      decoratedText={decoratedText}
      editorState={getEditorState()}
    >
      {children}
    </Component>
  );
}
