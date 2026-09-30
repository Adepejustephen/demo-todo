import { useRef } from 'react'

/** A tab strip for switching how the current view is drawn. Arrow keys move between tabs. */
export default function Tabs({ tabs, value, onChange, label = 'View style' }) {
  const refs = useRef({})

  function onKeyDown(e) {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const i = tabs.findIndex((t) => t.id === value)
    const next = tabs[(i + dir + tabs.length) % tabs.length]
    onChange(next.id)
    refs.current[next.id]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex gap-1 rounded-lg bg-sunk p-1">
      {tabs.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[tab.id] = el
            }}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`rounded-md px-3 py-1.5 text-[13px] transition-colors ${
              active ? 'bg-panel font-medium text-fg shadow-sm' : 'text-muted hover:text-fg'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
