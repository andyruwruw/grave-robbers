// Packages
import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Visual variants for the Button component.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';

/**
 * Size variants for the Button component.
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

/**
 * Props for the Button component.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant. Defaults to 'primary'.
   */
  variant?: ButtonVariant;

  /**
   * Size. Defaults to 'md'.
   */
  size?: ButtonSize;

  /**
   * Shows a spinner and disables interaction.
   */
  loading?: boolean;

  /**
   * Icon hugging the label on the left.
   */
  prependInner?: React.ReactNode;

  /**
   * Icon hugging the label on the right.
   */
  appendInner?: React.ReactNode;

  /**
   * Node rendered OUTSIDE the button box, before it.
   */
  prependOuter?: React.ReactNode;

  /**
   * Node rendered OUTSIDE the button box, after it.
   */
  appendOuter?: React.ReactNode;

  /**
   * Stretches the button to full width.
   */
  block?: boolean;
}

const BASE_CLASSES = 'inline-flex items-center justify-center gap-2 rounded-md border font-medium cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:opacity-60 disabled:pointer-events-none data-[loading]:opacity-60 data-[loading]:pointer-events-none';

/**
 * Tailwind classes per visual variant. Each variant sets its own border color
 * (never a shared `border-transparent` in BASE_CLASSES): two border-color
 * utilities on one element resolve by generated-CSS order, not class-string
 * order, so a shared default silently beats the variant's color. Hover and
 * press tints are mixed from `muted` toward the text color rather than
 * stepping muted -> border, so they stay visible in palettes where those two
 * tokens coincide (radix-2 dark).
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-brand text-on-brand hover:bg-brand-hover active:brightness-90',
  secondary: 'border-border bg-muted text-foreground hover:bg-[color:color-mix(in_srgb,var(--arw-muted),var(--arw-text-1)_8%)] active:bg-[color:color-mix(in_srgb,var(--arw-muted),var(--arw-text-1)_16%)]',
  ghost: 'border-transparent bg-transparent text-foreground-muted hover:bg-muted hover:text-foreground active:bg-[color:color-mix(in_srgb,var(--arw-muted),var(--arw-text-1)_10%)]',
  danger: 'border-transparent bg-danger text-on-brand hover:bg-danger-hover active:brightness-90',
  outline: 'border-border bg-transparent text-foreground hover:bg-muted hover:border-foreground-subtle active:bg-[color:color-mix(in_srgb,var(--arw-muted),var(--arw-text-1)_10%)]',
};

/**
 * Tailwind classes per size. Explicit heights (border included) so sizes
 * line up with other controls: `lg` (36px) matches TextField/Select, which
 * is what FormRow pairs it with; `icon` is square at `md` height.
 */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-6 gap-1 px-2 text-[11px]',
  md: 'h-[1.875rem] px-2.5 text-xs',
  lg: 'h-9 px-4 text-sm',
  icon: 'h-[1.875rem] w-[1.875rem] p-0',
};

/**
 * Standard button.
 *
 * @param {ButtonProps} props - Component props.
 * @returns {React.JSX.Element} The rendered button.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  prependInner,
  appendInner,
  prependOuter,
  appendOuter,
  block = false,
  className = '',
  children,
  ...rest
}, ref): React.JSX.Element {
  const hasOuter = prependOuter !== undefined || appendOuter !== undefined;

  const button = (
    <button
      type='button'
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${block ? 'w-full' : ''} ${className}`.trim()}
      {...(loading && { 'data-loading': '' })}
      ref={ref}
      {...rest}>
      {loading ? <Loader2 size={13} className='animate-spin' /> : prependInner}
      {children}
      {appendInner}
    </button>
  );

  if (!hasOuter) {
    return button;
  }

  // Outer slots sit OUTSIDE the button box, adjacent to it.
  return (
    <span className='inline-flex items-center gap-1.5'>
      {prependOuter}
      {button}
      {appendOuter}
    </span>
  );
});

export default Button;
