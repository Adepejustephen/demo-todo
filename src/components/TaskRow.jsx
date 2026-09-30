import { useState } from 'react'
import Check from './Check.jsx'
import DueChip from './DueChip.jsx'

const STRIPE = { 1: 'var(--late)', 2: 'var(--due)', 3: 'var(--accent)' }

export default function TaskRow({ task, lists, onToggle, onRemove, onRename, onCyclePriority, dragId, setDragId, onDrop }) {
  const [over, setOver] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)

  const list = lists.find((l) => l.id === task.list)

  function commit() {
    const value = draft.trim()
    if (value) onRename(task.id, value)
    else setDraft(task.title)
    setEditing(false)
  }

  return (
    <li
      draggable={!editing}
      onDragStart={() => setDragId(task.id)}
      onDragEnd={() => {
        setDragId(null)
        setOver(false)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        onDrop(task.id)
      }}
      className={`row-in group relative flex items-start gap-3 border-b border-line bg-panel py-3 pr-3 pl-5 last:border-b-0 ${
        dragId === task.id ? 'dragging ' : ''
      }${over ? 'drop-over' : ''}`}
    >
      <span
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-0 w-[3px]"
        style={{ background: task.done ? 'transparent' : (STRIPE[task.priority] ?? 'transparent') }}
      />

      <Check
        on={task.done}
        onClick={() => onToggle(task.id)}
        label={`${task.done ? 'Mark not done' : 'Mark done'}: ${task.title}`}
      />

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(task.title)
                setEditing(false)
              }
            }}
            aria-label="Task name"
            className="w-full rounded border border-accent bg-sunk px-2 py-1 text-[15px] focus:outline-none"
          />
        ) : (
          <p
            onDoubleClick={() => setEditing(true)}
            className={`text-[15px] leading-snug break-words ${task.done ? 'text-faint line-through' : 'text-fg'}`}
          >
            {task.title}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <DueChip due={task.due} done={task.done} />
          {task.due && list && (
            <span aria-hidden="true" className="text-[11px] text-faint">
              •
            </span>
          )}
          {list && <span className="text-[12px] text-faint">{list.name}</span>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => onCyclePriority(task.id)}
          aria-label={`Change priority for ${task.title}`}
          className="rounded px-2 py-1 text-[12px] text-muted transition-colors hover:bg-sunk"
        >
          {task.priority ? `P${task.priority}` : '—'}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Rename ${task.title}`}
          className="rounded px-2 py-1 text-[12px] text-muted transition-colors hover:bg-sunk"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onRemove(task.id)}
          aria-label={`Delete ${task.title}`}
          className="rounded px-2 py-1 text-[12px] text-muted transition-colors hover:bg-sunk hover:text-late"
        >
          Delete
        </button>
      </div>
    </li>
  )
}
