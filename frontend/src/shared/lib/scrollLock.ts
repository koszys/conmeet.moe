let lockCount = 0;
let previousBodyOverflow = '';
let previousHtmlOverflow = '';

/**
 * Ref-counted body and document scroll lock.
 * Prevents body and root page scrolling while one or more modals or lightboxes are open,
 * and restores scrolling safely when the last one closes.
 */
export function lockBodyScroll(): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  if (lockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
  lockCount++;

  let unlocked = false;
  return () => {
    if (unlocked) return;
    unlocked = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.overflow = previousBodyOverflow || '';
      document.documentElement.style.overflow = previousHtmlOverflow || '';
    }
  };
}
