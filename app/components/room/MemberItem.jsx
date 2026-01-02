import React from 'react';

/**
 * Individual member item component for members list
 * @param {Object} props
 * @param {string} props.id - Member's socket ID
 * @param {string} props.name - Member's display name
 * @param {boolean} props.isCurrentUser - Whether this is the current user
 * @param {boolean} props.isHost - Whether this member is the host
 * @param {'online' | 'away' | 'busy'} props.status - Member's status
 * @param {string} props.className - Additional CSS classes
 */
export function MemberItem({
  id,
  name,
  isCurrentUser = false,
  isHost = false,
  status = 'online',
  className = '',
  ...props
}) {
  const statusColors = {
    online: 'bg-emerald-500',
    away: 'bg-amber-500',
    busy: 'bg-hero-red'
  };

  const truncatedId = id ? `${id.slice(0, 6)}...` : '';

  return (
    <div
      className={`
        flex items-center gap-3 p-3
        border-b-2 border-ink/20 last:border-b-0
        ${isCurrentUser ? 'bg-hero-yellow/20' : 'hover:bg-ink/5'}
        transition-colors duration-150
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className={`
          w-10 h-10 rounded-full
          flex items-center justify-center
          text-lg font-bold uppercase
          ${isHost ? 'bg-hero-red text-white' : 'bg-hero-blue text-white'}
          border-2 border-ink
          shadow-[2px_2px_0px_var(--color-ink)]
        `}>
          {name ? name.charAt(0) : '?'}
        </div>
        {/* Status indicator */}
        <div className={`
          absolute -bottom-0.5 -right-0.5
          w-3.5 h-3.5 rounded-full
          ${statusColors[status]}
          border-2 border-paper
        `} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-action font-bold text-sm truncate">
            {name || 'Anonymous'}
          </span>
          {isCurrentUser && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-hero-yellow text-ink rounded border border-ink">
              You
            </span>
          )}
          {isHost && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-hero-red text-white rounded border border-ink">
              Host
            </span>
          )}
        </div>
        <div className="text-xs text-ink/50 font-mono truncate">
          {truncatedId}
        </div>
      </div>

      {/* Actions slot (optional) */}
    </div>
  );
}

/**
 * Compact member avatar for inline displays
 */
export function MemberAvatar({
  name,
  size = 'md',
  isHost = false,
  className = '',
  ...props
}) {
  const sizeStyles = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  return (
    <div
      className={`
        ${sizeStyles[size]}
        rounded-full
        flex items-center justify-center
        font-bold uppercase
        ${isHost ? 'bg-hero-red text-white' : 'bg-hero-blue text-white'}
        border-2 border-ink
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      title={name}
      {...props}
    >
      {name ? name.charAt(0) : '?'}
    </div>
  );
}

/**
 * Member count badge
 */
export function MemberCount({
  count,
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        px-2 py-1
        bg-hero-blue text-white
        rounded-full
        text-xs font-bold
        border-2 border-ink
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
      <span>{count}</span>
    </div>
  );
}

export default MemberItem;
