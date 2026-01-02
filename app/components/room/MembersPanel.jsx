'use client';

/**
 * MemberItem Component
 * Displays a single member in the members list
 */
function MemberItem({ member, isCurrentUser, variant = 'mobile' }) {
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className="w-6 h-6 rounded-full bg-pastel-blue border-2 border-ink flex items-center justify-center text-xs font-bold">
          {member.name ? member.name.charAt(0).toUpperCase() : 'G'}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold truncate">{member.name || 'Guest'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-panel-bg)] border-2 border-ink rounded-lg p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white border-2 border-ink flex items-center justify-center font-bold text-lg">
        {member.name ? member.name.charAt(0).toUpperCase() : 'G'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-base truncate">
          {member.name || 'Guest'}
          {isCurrentUser && (
            <span className="ml-2 text-xs bg-green-300 px-2 py-1 rounded-full border border-ink">
              You
            </span>
          )}
        </p>
      </div>
      <div className="w-3 h-3 bg-green-500 rounded-full border border-ink animate-pulse"></div>
    </div>
  );
}

/**
 * MembersPanel Component (Mobile version)
 * Full panel for mobile devices
 */
export function MembersPanelMobile({ members, currentUserId }) {
  return (
    <div className="sm:hidden comic-panel p-6 hover-lift">
      <h2 className="text-3xl font-black mb-6 inline-block transform -rotate-1 bg-[var(--color-pastel-blue)] px-4 py-2 border-3 border-ink shadow-[4px_4px_0px_0px_var(--color-ink)]">
        Room Members
      </h2>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {members.map((member) => (
          <MemberItem 
            key={member.id} 
            member={member} 
            isCurrentUser={member.id === currentUserId}
            variant="mobile"
          />
        ))}
        {members.length === 0 && (
          <p className="text-center py-4 italic opacity-50">No members yet...</p>
        )}
      </div>
    </div>
  );
}

/**
 * MembersPanel Component (Inline header version)
 * Compact panel for header display
 */
export function MembersPanelInline({ members, maxVisible = 5 }) {
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  return (
    <div className="hidden sm:flex items-center">
      <div className="comic-panel bg-paper/90 backdrop-blur-sm overflow-hidden flex flex-col shadow-md rounded-md w-64">
        <div className="bg-pastel-yellow border-b-3 border-ink p-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          <h4 className="text-sm font-black">Members</h4>
        </div>
        <div className="p-2 max-h-36 overflow-y-auto">
          {visibleMembers.map((member) => (
            <MemberItem key={member.id} member={member} variant="inline" />
          ))}
          {remainingCount > 0 && (
            <div className="text-xs text-ink opacity-70 py-1">+{remainingCount} more</div>
          )}
        </div>
      </div>
    </div>
  );
}