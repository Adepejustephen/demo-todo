export default function Check({ on, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-on={String(on)}
      aria-pressed={on}
      aria-label={label}
      className="check mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2 transition-colors"
      style={{ borderColor: on ? 'var(--done)' : 'var(--line)', background: on ? 'var(--done)' : 'transparent' }}
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3 8.5l3.2 3.2L13 5"
          stroke={on ? 'var(--panel)' : 'transparent'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
