import { useState } from 'react'

function RailButton({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active}
      className={`flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-[14px] transition-colors ${
        active ? 'bg-accentsoft font-medium text-accent' : 'text-muted hover:bg-panel hover:text-fg'
      }`}
    >
      <span className="truncate">{label}</span>
      {count > 0 && <span className="mono text-[12px] opacity-70">{count}</span>}
    </button>
  )
}

export default function Sidebar({ views, lists, counts, view, setView, onAddList }) {
  const [name, setName] = useState('')

  function submit(e) {
    e.preventDefault()
    const id = onAddList(name)
    if (id) setView(id)
    setName('')
  }

  return (
    <nav className="shrink-0 md:w-52">
      <div className="rail flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {views.map((v) => (
          <RailButton
            key={v.id}
            active={view === v.id}
            label={v.label}
            count={v.count}
            onClick={() => setView(v.id)}
          />
        ))}

        <span aria-hidden="true" className="my-2 hidden h-px bg-line md:block" />

        {lists.map((l) => (
          <RailButton
            key={l.id}
            active={view === l.id}
            label={l.name}
            count={counts[l.id]}
            onClick={() => setView(l.id)}
          />
        ))}
      </div>

      <form onSubmit={submit} className="mt-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="+ New list"
          aria-label="Name a new list"
          className="w-full rounded-lg border border-transparent bg-transparent px-3 py-2 text-[13px] text-muted transition-colors placeholder:text-faint hover:border-line focus:border-accent focus:text-fg focus:outline-none"
        />
      </form>
    </nav>
  )
}
