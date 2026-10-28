// Packages
import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  X,
} from 'lucide-react';

/**
 * Props for the TextField component.
 */
export interface TextFieldProps {
  /**
   * Current value (controlled).
   */
  value: string;

  /**
   * Called with the NEW STRING (not the event) on input.
   */
  onChange?: (value: string) => void;

  /**
   * Input type. `password` adds a show/hide toggle.
   */
  type?: 'text' | 'password' | 'email' | 'number';

  /**
   * Visual variant: `filled` (surface fill) or `outline` (transparent).
   */
  variant?: 'filled' | 'outline';

  /**
   * Placeholder text.
   */
  placeholder?: string;

  /**
   * Optional label rendered above the input.
   */
  label?: string;

  /**
   * Icon rendered inside the box, before the input.
   */
  prependInnerIcon?: React.ReactNode;

  /**
   * Icon rendered inside the box, after the input.
   */
  appendInnerIcon?: React.ReactNode;

  /**
   * Node rendered OUTSIDE the box, before it (e.g. a leading select/button).
   */
  prependOuter?: React.ReactNode;

  /**
   * Node rendered OUTSIDE the box, after it (e.g. a submit button).
   */
  appendOuter?: React.ReactNode;

  /**
   * Shows an ✕ that clears the value.
   */
  clearable?: boolean;

  /**
   * Error state styling.
   */
  error?: boolean;

  /**
   * Error text shown below the field; also drives the error border.
   */
  errorMessage?: string;

  /**
   * Helper text shown below the field.
   */
  hint?: string;

  /**
   * Whether the field is disabled.
   */
  disabled?: boolean;

  /**
   * Whether the field is read-only.
   */
  readonly?: boolean;

  /**
   * Optional extra class names on the wrapper.
   */
  className?: string;
}

/**
 * Standard single-line text input with inner/outer slots, an outline variant,
 * a clear button, and a password show/hide toggle.
 *
 * @param {TextFieldProps} props - Component props.
 * @returns {React.JSX.Element} The rendered field.
 */
function TextField({
  value,
  onChange,
  type = 'text',
  variant = 'filled',
  placeholder,
  label,
  prependInnerIcon,
  appendInnerIcon,
  prependOuter,
  appendOuter,
  clearable = false,
  error = false,
  errorMessage,
  hint,
  disabled = false,
  readonly = false,
  className = '',
}: TextFieldProps): React.JSX.Element {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && reveal ? 'text' : type;
  const hasError = error || errorMessage !== undefined;

  const box = (
    <div
      className={`flex flex-1 items-center gap-1.5 rounded-md border px-2.5 py-[0.4375rem] focus-within:border-brand focus-within:ring-1 focus-within:ring-ring data-[disabled]:opacity-60 ${
        variant === 'outline' ? 'bg-transparent' : 'bg-surface'
      } ${hasError ? 'border-danger' : 'border-border'}`.trim()}
      {...(disabled && { 'data-disabled': '' })}>
      {prependInnerIcon && <span className='inline-flex text-foreground-subtle'>{prependInnerIcon}</span>}
      <input
        className='min-w-0 flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle'
        type={inputType}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange?.(e.target.value)} />
      {clearable && value !== '' && !disabled && (
        <button type='button' aria-label='Clear' className='inline-flex text-foreground-subtle hover:text-foreground' onClick={(): void => onChange?.('')}>
          <X size={13} />
        </button>
      )}
      {isPassword && (
        <button type='button' aria-label={reveal ? 'Hide' : 'Show'} className='inline-flex text-foreground-subtle hover:text-foreground' onClick={(): void => setReveal((v: boolean): boolean => !v)}>
          {reveal ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      )}
      {appendInnerIcon && <span className='inline-flex text-foreground-subtle'>{appendInnerIcon}</span>}
    </div>
  );

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      {label && <label className='text-xs font-medium text-foreground-muted'>{label}</label>}
      {prependOuter || appendOuter ? (
        <div className='flex items-center gap-1.5'>
          {prependOuter && <span className='inline-flex items-center text-foreground-subtle'>{prependOuter}</span>}
          {box}
          {appendOuter && <span className='inline-flex items-center text-foreground-subtle'>{appendOuter}</span>}
        </div>
      ) : (
        box
      )}
      {errorMessage !== undefined ? (
        <span className='text-xs text-danger'>{errorMessage}</span>
      ) : (
        hint !== undefined && <span className='text-xs text-foreground-subtle'>{hint}</span>
      )}
    </div>
  );
}

export default TextField;
