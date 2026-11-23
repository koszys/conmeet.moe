export interface CommentAvatarProps {
  avatarUrl?: string | null;
  displayName: string;
  avatarLetter: string;
  isDeleted: boolean;
}

/**
 * Avatar with fallback letter and opaque backing to prevent threadline bleed.
 */
export function CommentAvatar({
  avatarUrl,
  displayName,
  avatarLetter,
  isDeleted,
}: CommentAvatarProps) {
  return (
    <div className="relative shrink-0">
      {avatarUrl && !isDeleted ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="border-ink relative z-20 h-6 w-6 shrink-0 rounded-full border-2 object-cover"
        />
      ) : (
        <div className="border-ink relative z-20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white text-[10px] font-bold text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          <span className="bg-accent/20 dark:bg-accent/30 flex h-full w-full items-center justify-center rounded-full">
            {isDeleted ? '?' : avatarLetter}
          </span>
        </div>
      )}
    </div>
  );
}
