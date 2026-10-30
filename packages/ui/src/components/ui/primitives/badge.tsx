// Packages
import React from 'react';

/**
 * Variant for the Badge component.
 */
export type BadgeVariant = 'default' | 'primary' | 'running' | 'pending' | 'retry' | 'success' | 'error' | 'warning';

/**
 * Size scale for the Badge component.
 */
export type BadgeSize = 'sm' | 'md';

/**
 * Props for the Badge component.
 */
interface BadgeProps {
  /**
   * Badge content.
   */
  children: React.ReactNode;

  /**
   * Color variant. Defaults to 'default'.
   */
  variant?: BadgeVariant;

  /**
   * Size scale. Defaults to 'md'.
   */
  size?: BadgeSize;

  /**
   * Optional leading icon node.
   */
  icon?: React.ReactNode;

  /**
   * Renders text uppercase.
   */
  uppercase?: boolean;

  /**
   * Optional extra class names.
   */
  className?: string;
}

/**
 * Returns the Badge variant for a status string.
 *
 * @param {string} status - The status string.
 * @returns {BadgeVariant} The corresponding variant.
 */
export function statusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'running':
      return 'running';
    case 'pending':
      return 'pending';
    case 'up-for-retry':
      return 'retry';
    case 'success':
      return 'success';
    case 'failure':
    case 'error':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Classes every badge gets, whatever its variant.
 */
const BASE_CLASSES = 'inline-flex items-center gap-1 rounded-sm text-xs';

/**
 * Tailwind classes per size scale.
 */
const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5',
  md: 'px-3 py-1',
};

/**
 * Tailwind classes per color variant.
 */
const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-status-default text-status-default-foreground',
  primary: 'bg-brand-muted text-brand-muted-foreground',
  running: 'bg-status-running text-status-running-foreground',
  pending: 'bg-status-pending text-status-pending-foreground',
  retry: 'bg-status-retry text-status-retry-foreground',
  success: 'bg-status-success text-status-success-foreground',
  error: 'bg-status-error text-status-error-foreground',
  warning: 'bg-status-warning text-status-warning-foreground',
};

/**
 * Inline pill badge for status, role, and label chips.
 *
 * @param {BadgeProps} props - Component props.
 * @returns {React.JSX.Element} The rendered badge.
 */
function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  uppercase = false,
  className = '',
}: BadgeProps): React.JSX.Element {
  return (
    <span className={`${BASE_CLASSES} ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${uppercase ? 'uppercase tracking-[0.03em]' : ''} ${className}`.trim()}>
      {icon && <span className='inline-flex shrink-0'>{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;
