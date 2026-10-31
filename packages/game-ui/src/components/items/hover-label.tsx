// Packages
import React, { useEffect, useRef, useState } from 'react';

// Local Imports
import { TAP_LABEL_MS } from '../../config/item-details';

/**
 * Props for the HoverLabel component.
 */
interface HoverLabelProps {
  /**
   * What it says.
   */
  label: string;

  /**
   * What it labels.
   */
  children: React.ReactNode;

  /**
   * Extra classes for the wrapper.
   */
  className?: string;
}

/**
 * Wraps something so hovering it, or tapping it on a phone, shows a small
 * label above it straight away (a title tooltip is slow, easy to miss, and
 * never shows on touch). A tap keeps it up for `TAP_LABEL_MS`.
 *
 * @param {HoverLabelProps} props - Component props.
 * @returns {React.JSX.Element} The wrapped content.
 */
function HoverLabel({ label, children, className = '' }: HoverLabelProps): React.JSX.Element {
  const [tapped, setTapped] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
  }, []);

  return (
    <span
      aria-label={label}
      className={`group relative ${className}`}
      onClick={(): void => {
        setTapped(true);
        if (timer.current) {
          clearTimeout(timer.current);
        }
        timer.current = setTimeout((): void => setTapped(false), TAP_LABEL_MS);
      }}>
      {children}
      <span className={`pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-[2px] border border-border bg-surface px-1.5 py-0.5 font-medium text-xs text-foreground shadow-md group-hover:block ${tapped ? 'block' : 'hidden'}`}>
        {label}
      </span>
    </span>
  );
}

export default HoverLabel;
