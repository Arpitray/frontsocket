import React from 'react';

/**
 * Reusable Panel component with Neo-Brutalist design system
 * @param {Object} props
 * @param {string} props.title - Panel title
 * @param {React.ReactNode} props.icon - Optional icon to display in header
 * @param {'default' | 'highlight' | 'danger' | 'success'} props.variant - Panel style variant
 * @param {boolean} props.noPadding - Remove internal padding
 * @param {React.ReactNode} props.children - Panel content
 * @param {React.ReactNode} props.footer - Optional footer content
 * @param {string} props.className - Additional CSS classes
 */
export function Panel({
  title,
  icon,
  variant = 'default',
  noPadding = false,
  children,
  footer,
  className = '',
  headerClassName = '',
  ...props
}) {
  const variantStyles = {
    default: {
      container: 'bg-[var(--color-paper)] border-ink',
      header: 'bg-[var(--color-hero-yellow)] border-ink text-[var(--color-ink)]',
      shadow: 'shadow-[8px_8px_0px_var(--color-ink)]'
    },
    highlight: {
      container: 'bg-[var(--color-paper)] border-[var(--color-hero-blue)]',
      header: 'bg-[var(--color-hero-blue)] border-[var(--color-hero-blue)] text-white',
      shadow: 'shadow-[8px_8px_0px_var(--color-hero-blue)]'
    },
    danger: {
      container: 'bg-[var(--color-paper)] border-[var(--color-hero-red)]',
      header: 'bg-[var(--color-hero-red)] border-[var(--color-hero-red)] text-white',
      shadow: 'shadow-[8px_8px_0px_var(--color-hero-red)]'
    },
    success: {
      container: 'bg-[var(--color-paper)] border-[var(--color-hero-green)]',
      header: 'bg-[var(--color-hero-green)] border-[var(--color-hero-green)] text-white',
      shadow: 'shadow-[8px_8px_0px_var(--color-hero-green)]'
    }
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`
        ${styles.container}
        ${styles.shadow}
        border-3
        overflow-hidden
        transition-all duration-300
        hover:translate-x-[-2px] hover:translate-y-[-2px]
        hover:shadow-[12px_12px_0px_var(--color-ink)]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {/* Header */}
      {title && (
        <div
          className={`
            ${styles.header}
            border-b-3 px-6 py-4
            font-display text-xl uppercase tracking-wider
            flex items-center gap-3
            ${headerClassName}
          `.trim().replace(/\s+/g, ' ')}
        >
          {icon && <span className="text-2xl">{icon}</span>}
          <span>{title}</span>
        </div>
      )}

      {/* Content */}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t-3 border-ink/20 px-6 py-4 bg-[var(--color-wash-grey)]/30">
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * Compact Panel variant for smaller content areas
 */
export function CompactPanel({
  title,
  children,
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        bg-[var(--color-paper)] border-3 border-ink
        shadow-[4px_4px_0px_var(--color-ink)]
        overflow-hidden
        transition-all duration-200
        hover:shadow-[6px_6px_0px_var(--color-ink)]
        hover:translate-x-[-2px] hover:translate-y-[-2px]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {title && (
        <div className="bg-[var(--color-wash-grey)] border-b-3 border-ink px-4 py-3 font-display text-sm uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Card Panel for grid layouts
 */
export function CardPanel({
  title,
  subtitle,
  icon,
  children,
  onClick,
  className = '',
  ...props
}) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`
        bg-[var(--color-paper)] border-3 border-ink
        shadow-[6px_6px_0px_var(--color-ink)]
        overflow-hidden
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:shadow-[3px_3px_0px_var(--color-ink)] hover:translate-x-[3px] hover:translate-y-[3px]' : 'hover:shadow-[8px_8px_0px_var(--color-ink)] hover:translate-x-[-2px] hover:translate-y-[-2px]'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      <div className="p-6">
        {icon && (
          <div className="w-14 h-14 bg-[var(--color-hero-blue)] border-3 border-ink flex items-center justify-center mb-4 shadow-[4px_4px_0px_var(--color-ink)]">
            <span className="text-3xl">{icon}</span>
          </div>
        )}
        {title && (
          <h3 className="font-display text-xl uppercase tracking-wide mb-2">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-[var(--color-ink)]/60 text-sm font-body leading-relaxed">
            {subtitle}
          </p>
        )}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default Panel;
