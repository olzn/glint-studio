/**
 * Imperative toast — called from event handlers, not rendered via JSX.
 * Uses the same CSS classes (.toast, .toast-visible) as the vanilla version.
 */

let activeToast: HTMLElement | null = null;

export function showToast(message: string): void {
  if (activeToast) {
    activeToast.remove();
    activeToast = null;
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  activeToast = toast;

  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.addEventListener(
      'transitionend',
      () => {
        toast.remove();
        if (activeToast === toast) activeToast = null;
      },
      { once: true },
    );
  }, 2000);
}
