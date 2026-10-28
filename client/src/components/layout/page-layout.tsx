// Packages
import React from 'react';

/**
 * Props for the glass PageLayout component.
 */
interface PageLayoutProps {
  /**
   * Page content.
   */
  children: React.ReactNode;

  /**
   * Renders the aurora orb backdrop behind the page. Defaults to true.
   */
  aurora?: boolean;

  /**
   * Optional extra class names.
   */
  className?: string;
}

/**
 * One aurora orb: a soft radial gradient (no filter blur, so it's cheap to
 * paint), placement, and drift timing.
 */
const ORBS: { color: string; className: string }[] = [
  {
    color: 'var(--arw-aurora-1)',
    className: '-left-[15%] -top-[25%] w-[70%] motion-safe:animate-[arw-aurora-drift_26s_ease-in-out_infinite_alternate]',
  },
  {
    color: 'var(--arw-aurora-2)',
    className: '-right-[20%] top-[10%] w-[65%] motion-safe:animate-[arw-aurora-drift_32s_ease-in-out_-8s_infinite_alternate-reverse]',
  },
  {
    color: 'var(--arw-aurora-3)',
    className: 'left-[20%] -bottom-[35%] w-[60%] motion-safe:animate-[arw-aurora-drift_38s_ease-in-out_-16s_infinite_alternate]',
  },
];

/**
 * glass PageLayout: the standard centered, max-width, padded shell, plus an
 * aurora backdrop. Structurally different from the base shell in that it is
 * its own stacking context (`isolate`) holding a pointer-events-none orb
 * layer behind the content: the colored light that glass panes and frosted
 * overlays refract. Orbs animate transform only, and only under
 * `prefers-reduced-motion: no-preference`.
 *
 * @param {PageLayoutProps} props - Component props.
 * @returns {React.JSX.Element} The rendered page shell.
 */
function PageLayout({
  children,
  aurora = true,
  className = '',
}: PageLayoutProps): React.JSX.Element {
  return (
    <div className='relative isolate overflow-hidden'>
      {aurora && (
        <div className='pointer-events-none absolute inset-0 -z-10' aria-hidden='true'>
          {ORBS.map((orb, i: number): React.JSX.Element => (
            <div
              key={i}
              className={`absolute aspect-square rounded-full will-change-transform ${orb.className}`}
              style={{ background: `radial-gradient(closest-side, ${orb.color}, transparent)` }} />
          ))}
        </div>
      )}
      <div className={`max-w-6xl mx-auto px-4 py-6 ${className}`.trim()}>
        {children}
      </div>
    </div>
  );
}

export default PageLayout;
