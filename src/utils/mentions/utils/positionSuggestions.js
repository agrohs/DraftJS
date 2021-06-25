const getRelativeParent = (element) => {
  if (!element) {
    return null;
  }

  const position = window
    .getComputedStyle(element)
    .getPropertyValue('position');

  if (position !== 'static') {
    return element;
  }

  return getRelativeParent(element.parentElement);
};

export default function positionSuggestions({
  decoratorRect,
  popover,
  props,
}) {
  const relativeParent = getRelativeParent(popover.parentElement);
  let relativeRect;

  if (relativeParent) {
    const relativeParentRect = relativeParent.getBoundingClientRect();
    relativeRect = {
      scrollLeft: relativeParent.scrollLeft,
      scrollTop: relativeParent.scrollTop,
      left: decoratorRect.left - relativeParentRect.left,
      top: decoratorRect.bottom - relativeParentRect.top,
    };
  } else {
    relativeRect = {
      scrollTop: window.pageYOffset || document.documentElement.scrollTop,
      scrollLeft: window.pageXOffset || document.documentElement.scrollLeft,
      top: decoratorRect.bottom,
      left: decoratorRect.left,
    };
  }

  const left = relativeRect.left + relativeRect.scrollLeft;
  const top = relativeRect.top + relativeRect.scrollTop;

  let transform;
  let transition;
  if (props.open) {
    if (props.suggestions.length > 0) {
      transform = 'scale(1)';
      transition = 'all 0.25s cubic-bezier(.3,1.2,.2,1)';
    } else {
      transform = 'scale(0)';
      transition = 'all 0.35s cubic-bezier(.3,1,.2,1)';
    }
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
    transform,
    transformOrigin: '1em 0%',
    transition,
  };
}
