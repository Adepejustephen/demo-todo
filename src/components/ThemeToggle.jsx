/** Flips between light and dark, starting from whatever the OS is currently showing. */
export default function ThemeToggle() {
  function flip() {
    const root = document.documentElement
    const current = root.getAttribute('data-theme')
    const dark = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches)
    root.setAttribute('data-theme', dark ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={flip}
      className="rounded-lg border border-line px-3 py-2 text-[13px] text-muted transition-colors hover:border-accent hover:text-fg"
    >
      Theme
    </button>
  )
}
