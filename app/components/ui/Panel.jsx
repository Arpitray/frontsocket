import React from 'react';

/**
 * Reusable Panel component with comic/watercolor theme
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
      container: 'bg-paper border-ink',
      header: 'bg-hero-yellow border-ink text-ink',
      shadow: 'shadow-[8px_8px_0px_var(--color-ink)]'
    },
    highlight: {
      container: 'bg-paper border-hero-blue',
      header: 'bg-hero-blue border-hero-blue text-white',
      shadow: 'shadow-[8px_8px_0px_var(--color-hero-blue)]'
    },
    danger: {
      container: 'bg-paper border-hero-red',
      header: 'bg-hero-red border-hero-red text-white',
      shadow: 'shadow-[8px_8px_0px_var(--color-hero-red)]'
    },
    success: {
      container: 'bg-paper border-emerald-600',
      header: 'bg-emerald-500 border-emerald-600 text-white',
      shadow: 'shadow-[8px_8px_0px_rgb(5,150,105)]'
    }
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`
        ${styles.container}
        ${styles.shadow}
        border-4 rounded-sm
        comic-panel paper-texture
        overflow-hidden
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {/* Header */}
      {title && (
        <div
          className={`
            ${styles.header}
            border-b-4 px-6 py-3
            font-display text-xl font-bold uppercase tracking-wider
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
        <div className="border-t-2 border-ink/20 px-6 py-4 bg-ink/5">
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
        bg-paper border-2 border-ink rounded-sm
        shadow-[4px_4px_0px_var(--color-ink)]
        overflow-hidden
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {title && (
        <div className="bg-ink/10 border-b-2 border-ink px-4 py-2 font-action text-sm font-bold uppercase">
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
        bg-paper border-3 border-ink rounded-sm
        shadow-[6px_6px_0px_var(--color-ink)]
        overflow-hidden
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:shadow-[3px_3px_0px_var(--color-ink)] hover:translate-x-[3px] hover:translate-y-[3px]' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      <div className="p-5">
        {icon && (
          <div className="text-4xl mb-3">{icon}</div>
        )}
        {title && (
          <h3 className="font-display text-lg font-bold uppercase tracking-wide mb-1">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-ink/70 text-sm font-body">
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
