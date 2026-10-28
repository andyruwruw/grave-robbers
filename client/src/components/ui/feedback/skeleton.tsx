// Packages
import React from 'react';

/**
 * Props for the Skeleton component.
 */
interface SkeletonProps {
  /**
   * Width (CSS length; number → px).
   */
  width?: string | number;

  /**
   * Height (CSS length; number → px).
   */
  height?: string | number;

  /**
   * Border radius (CSS length; number → px).
   */
  radius?: string | number;

  /**
   * Margin (any CSS margin value).
   */
  margin?: string | number;

  /**
   * Extra style, merged last (overrides the convenience props).
   */
  style?: React.CSSProperties;

  /**
   * Optional extra class names.
   */
  className?: string;
}

/**
 * Animated pulse block. RULE: every data-fetching component shows a skeleton
 * on first load: never a spinner or "Loading…" text.
 *
 * @param {SkeletonProps} props - Component props.
 * @returns {React.JSX.Element} The rendered skeleton.
 */
export function Skeleton({
  width,
  height,
  radius,
  margin,
  style,
  className = '',
}: SkeletonProps): React.JSX.Element {
  return (
    <div
      className={`bg-muted animate-pulse ${className}`.trim()}
      style={{
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
        borderRadius: radius ?? 'var(--arw-radius-sm)',
        ...(margin !== undefined && { margin }),
        ...style,
      }} />
  );
}

/**
 * Full-page skeleton for a list page's first load (early return).
 *
 * @param {{ rows?: number }} props - Component props.
 * @returns {React.JSX.Element} The rendered skeleton.
 */
export function PageSkeleton({ rows = 5 }: { rows?: number }): React.JSX.Element {
  return (
    <div>
      <Skeleton style={{ height: '1.75rem', width: '12rem', marginBottom: '1rem' }} />
      <ListSkeleton rows={rows} />
    </div>
  );
}

/**
 * Multi-line text placeholder skeleton.
 *
 * @param {{ lines?: number }} props - Component props.
 * @returns {React.JSX.Element} The rendered skeleton.
 */
export function TextSkeleton({ lines = 3 }: { lines?: number }): React.JSX.Element {
  return (
    <div className='flex flex-col gap-2'>
      {Array.from({ length: lines }).map((_, i: number) => (
        <Skeleton key={i} style={{ height: '0.875rem', width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  );
}

/**
 * List-shaped skeleton for sections and sub-pages.
 *
 * @param {{ rows?: number }} props - Component props.
 * @returns {React.JSX.Element} The rendered skeleton.
 */
export function ListSkeleton({ rows = 4 }: { rows?: number }): React.JSX.Element {
  return (
    <div className='bg-surface border border-border rounded-lg overflow-hidden'>
      {Array.from({ length: rows }).map((_, i: number) => (
        <div key={i} className='flex items-center gap-3 px-3 py-2 border-b border-divider last:border-b-0'>
          <Skeleton style={{ height: '0.875rem', width: '100%' }} />
        </div>
      ))}
    </div>
  );
}
