import React from 'react';

/**
 * Reusable Button component with comic/watercolor theme variants
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
    font-action font-bold uppercase tracking-wider
    border-2 border-ink rounded-sm
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hero-blue
  `;

  const variantStyles = {
    primary: `
      bg-hero-blue text-white
      shadow-[4px_4px_0px_var(--color-ink)]
      hover:shadow-[2px_2px_0px_var(--color-ink)]
      hover:translate-x-[2px] hover:translate-y-[2px]
      active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
    `,
    secondary: `
      bg-paper text-ink
      shadow-[4px_4px_0px_var(--color-ink)]
      hover:shadow-[2px_2px_0px_var(--color-ink)]
      hover:translate-x-[2px] hover:translate-y-[2px]
      active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
    `,
    danger: `
      bg-hero-red text-white
      shadow-[4px_4px_0px_var(--color-ink)]
      hover:shadow-[2px_2px_0px_var(--color-ink)]
      hover:translate-x-[2px] hover:translate-y-[2px]
      active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
    `,
    success: `
      bg-emerald-500 text-white
      shadow-[4px_4px_0px_var(--color-ink)]
      hover:shadow-[2px_2px_0px_var(--color-ink)]
      hover:translate-x-[2px] hover:translate-y-[2px]
      active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
    `,
    ghost: `
      bg-transparent text-ink
      hover:bg-paper/50
      shadow-none
    `
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
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
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const variantStyles = {
    primary: 'bg-hero-blue text-white hover:bg-hero-blue/90',
    secondary: 'bg-paper text-ink hover:bg-ink/10',
    danger: 'bg-hero-red text-white hover:bg-hero-red/90',
    ghost: 'bg-transparent text-ink hover:bg-paper/50'
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
        border-2 border-ink rounded-full
        flex items-center justify-center
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hero-blue
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
