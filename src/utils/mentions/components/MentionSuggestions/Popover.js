import React, { useState } from 'react';
import { usePopper } from 'react-popper';

export default function Popover({
  store,
  children,
  className,
  popperOptions = { placement: 'bottom-start' },
}) {
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(
    store.getReferenceElement(),
    popperElement,
    popperOptions
  );
  return (
    <div
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
      className={className}
    >
      {children}
    </div>
  );
}
