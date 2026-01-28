import React from 'react';

/**
 * Reusable Button component with Neo-Brutalist design system
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'danger' | 'success' | 'ghost'} props.variant - Button style variant
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  children,
  className = '',
  onClick,
  type = 'button',
  title,
  ...props
}) {
  const baseStyles = `
    font-body font-bold uppercase tracking-wider
    border-3 border-ink
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-hero-blue)]
  `;

  const variantStyles = {
    primary: `
      bg-[var(--color-hero-blue)] text-white
      shadow-[6px_6px_0px_var(--color-ink)]
      hover:shadow-[3px_3px_0px_var(--color-ink)]
      hover:translate-x-[3px] hover:translate-y-[3px]
      active:shadow-none active:translate-x-[6px] active:translate-y-[6px]
    `,
    secondary: `
      bg-[var(--color-paper)] text-[var(--color-ink)]
      shadow-[6px_6px_0px_var(--color-ink)]
      hover:shadow-[3px_3px_0px_var(--color-ink)]
      hover:translate-x-[3px] hover:translate-y-[3px]
      active:shadow-none active:translate-x-[6px] active:translate-y-[6px]
    `,
    danger: `
      bg-[var(--color-hero-red)] text-white
      shadow-[6px_6px_0px_var(--color-ink)]
      hover:shadow-[3px_3px_0px_var(--color-ink)]
      hover:translate-x-[3px] hover:translate-y-[3px]
      active:shadow-none active:translate-x-[6px] active:translate-y-[6px]
    `,
    success: `
      bg-[var(--color-hero-green)] text-white
      shadow-[6px_6px_0px_var(--color-ink)]
      hover:shadow-[3px_3px_0px_var(--color-ink)]
      hover:translate-x-[3px] hover:translate-y-[3px]
      active:shadow-none active:translate-x-[6px] active:translate-y-[6px]
    `,
    ghost: `
      bg-transparent text-[var(--color-ink)]
      hover:bg-[var(--color-wash-grey)]
      shadow-none
    `
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`
        ${baseStyles}
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${widthStyle}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Icon Button variant - circular button for icons
 */
export function IconButton({
  variant = 'secondary',
  size = 'md',
  disabled = false,
  children,
  className = '',
  onClick,
  title,
  ...props
}) {
  const sizeStyles = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14'
  };

  const variantStyles = {
    primary: 'bg-[var(--color-hero-blue)] text-white hover:bg-[var(--color-hero-blue)]/90',
    secondary: 'bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[var(--color-wash-grey)]',
    danger: 'bg-[var(--color-hero-red)] text-white hover:bg-[var(--color-hero-red)]/90',
    ghost: 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-wash-grey)]'
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        border-3 border-ink
        flex items-center justify-center
        transition-all duration-200
        shadow-[4px_4px_0px_var(--color-ink)]
        hover:shadow-[2px_2px_0px_var(--color-ink)]
        hover:translate-x-[2px] hover:translate-y-[2px]
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-hero-blue)]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
