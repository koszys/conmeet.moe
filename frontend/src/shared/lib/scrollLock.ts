let lockCount = 0;
let previousOverflow = '';

/**
 * Ref-counted body scroll lock.
 * Prevents body scrolling while one or more modals or lightboxes are open,
 * and restores scrolling safely when the last one closes.
 */
export function lockBodyScroll(): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount++;

  let unlocked = false;
  return () => {
    if (unlocked) return;
    unlocked = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.overflow = previousOverflow || '';
    }
  };
}
