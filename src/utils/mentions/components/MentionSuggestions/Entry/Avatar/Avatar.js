import React from 'react';

export default function Avatar({
  mention,
  theme = {},
}) {
  if (mention.avatar) {
    return (
      <img
        src={mention.avatar}
        className={theme.mentionSuggestionsEntryAvatar}
        role="presentation"
      />
    );
  }

  return null;
}
