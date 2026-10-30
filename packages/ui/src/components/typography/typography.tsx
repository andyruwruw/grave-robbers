// Packages
import React, { useState } from 'react';
import {
  Check,
  Copy,
} from 'lucide-react';

/**
 * Page h1: one per page.
 *
 * @param {{ children: React.ReactNode; className?: string }} props - Component props.
 * @returns {React.JSX.Element} The rendered title.
 */
export function PageTitle({
  children,
  className = '',
}: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return (
    <h1 className={`mb-1 text-2xl font-semibold text-foreground ${className}`.trim()}>
      {children}
    </h1>
  );
}

/**
 * Section h2.
 *
 * @param {{ children: React.ReactNode; className?: string }} props - Component props.
 * @returns {React.JSX.Element} The rendered title.
 */
export function SectionTitle({
  children,
  className = '',
}: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return (
    <h2 className={`mb-2 mt-6 text-base font-semibold text-foreground first:mt-0 ${className}`.trim()}>
      {children}
    </h2>
  );
}

/**
 * Standard paragraph text.
 *
 * @param {{ children: React.ReactNode; className?: string }} props - Component props.
 * @returns {React.JSX.Element} The rendered paragraph.
 */
export function Body({
  children,
  className = '',
}: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return (
    <p className={`mb-3 text-sm text-foreground last:mb-0 ${className}`.trim()}>
      {children}
    </p>
  );
}

/**
 * Small secondary metadata/label text.
 *
 * @param {{ children: React.ReactNode; className?: string }} props - Component props.
 * @returns {React.JSX.Element} The rendered caption.
 */
export function Caption({
  children,
  className = '',
}: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return (
    <span className={`text-xs text-foreground-muted ${className}`.trim()}>
      {children}
    </span>
  );
}

/**
 * Metadata line: icon/label fragments under a title.
 *
 * @param {{ children: React.ReactNode; className?: string }} props - Component props.
 * @returns {React.JSX.Element} The rendered line.
 */
export function MetaLine({
  children,
  className = '',
}: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return (
    <div className={`mt-1 flex items-center gap-1.5 text-xs text-foreground-muted ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * Monospace text for ids, hashes, and code.
 *
 * @param {{ children: React.ReactNode; className?: string }} props - Component props.
 * @returns {React.JSX.Element} The rendered code element.
 */
export function Mono({
  children,
  className = '',
}: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return (
    <code className={`font-mono text-xs text-foreground-subtle ${className}`.trim()}>
      {children}
    </code>
  );
}

/**
 * Props for the Copyable component.
 */
interface CopyableProps {
  /**
   * The string copied to the clipboard.
   */
  value: string;

  /**
   * Typography element displayed beside the copy button.
   */
  children: React.ReactNode;
}

/**
 * Wraps a typography child with a click-to-copy button.
 *
 * @param {CopyableProps} props - Component props.
 * @returns {React.JSX.Element} The rendered copyable row.
 */
export function Copyable({
  value,
  children,
}: CopyableProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  /**
   * Copies the value and flashes the check icon.
   */
  const handleCopy = (): void => {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(
      (): void => setCopied(false),
      1_200,
    );
  };

  return (
    <span
      className='group inline-flex items-center gap-1.5 cursor-pointer'
      onClick={handleCopy}>
      {children}
      <span className='inline-flex p-0.5 rounded-sm text-foreground-subtle opacity-0 transition-opacity duration-150 group-hover:opacity-100'>
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </span>
    </span>
  );
}
