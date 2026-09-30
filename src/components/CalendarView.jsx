import { useMemo, useState } from 'react'
import {
  WEEKDAY_SHORT,
  addMonths,
  daysFromToday,
  dueLabel,
  fromISO,
  monthGrid,
  monthLabel,
  thisMonth,
  todayISO,
} from '../lib/dates.js'

const STRIPE = { 1: 'var(--late)', 2: 'var(--due)', 3: 'var(--accent)' }

function chipColor(task) {
  if (task.done) return 'var(--faint)'
  if (task.due && daysFromToday(task.due) < 0) return 'var(--late)'
  return STRIPE[task.priority] ?? 'var(--muted)'
}

function Chip({ task, onPick }) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.stopPropagation()
        e.dataTransfer.setData('text/plain', String(task.id))
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={(e) => {
        e.stopPropagation()
        onPick(task.due)
      }}
      title={task.title}
      className="hidden w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[11px] hover:bg-sunk sm:flex"
    >
      <span aria-hidden="true" className="h-2.5 w-[3px] shrink-0 rounded-full" style={{ background: chipColor(task) }} />
      <span className={`truncate ${task.done ? 'text-faint line-through' : 'text-muted'}`}>{task.title}</span>
    </button>
  )
}

/**
 * A month of due dates. Days are selectable — the chosen day's tasks are listed
 * underneath — and a task can be dragged onto another day to reschedule it.
 */
export default function CalendarView({ tasks, selected, onSelectDay, onReschedule }) {
  const [cursor, setCursor] = useState(thisMonth)
  const [dropTarget, setDropTarget] = useState(null)

  const cells = useMemo(() => monthGrid(cursor), [cursor])
  const today = todayISO()

  const byDay = useMemo(() => {
    const map = new Map()
    tasks.forEach((t) => {
      if (!t.due) return
      if (!map.has(t.due)) map.set(t.due, [])
      map.get(t.due).push(t)
    })
    return map
  }, [tasks])

  const unscheduled = useMemo(() => tasks.filter((t) => !t.due && !t.done), [tasks])

  function drop(e, iso) {
    e.preventDefault()
    setDropTarget(null)
    const id = Number(e.dataTransfer.getData('text/plain'))
    if (id) onReschedule(id, iso)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="disp text-[15px] font-semibold">{monthLabel(cursor)}</h3>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCursor((c) => addMonths(c, -1))}
            aria-label="Previous month"
            className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:text-fg"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => {
              setCursor(thisMonth())
              onSelectDay(today)
            }}
            className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:text-fg"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            aria-label="Next month"
            className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:text-fg"
          >
            →
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <div className="grid grid-cols-7 border-b border-line">
          {WEEKDAY_SHORT.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[11px] tracking-wide text-faint">
              <span className="sm:hidden">{d.charAt(0)}</span>
              <span className="hidden sm:inline">{d}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((cell) => {
            const list = byDay.get(cell.iso) ?? []
            const open = list.filter((t) => !t.done)
            const isToday = cell.iso === today
            const isSelected = cell.iso === selected
            return (
              <button
                type="button"
                key={cell.iso}
                onClick={() => onSelectDay(cell.iso)}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDropTarget(cell.iso)
                }}
                onDragLeave={() => setDropTarget((d) => (d === cell.iso ? null : d))}
                onDrop={(e) => drop(e, cell.iso)}
                aria-label={`${dueLabel(cell.iso)}, ${fromISO(cell.iso).toLocaleDateString()} — ${open.length} open`}
                aria-current={isToday ? 'date' : undefined}
                className={`flex min-h-[74px] flex-col gap-1 border-r border-b border-line p-1.5 text-left transition-colors last:border-r-0 sm:min-h-[104px] ${
                  cell.inMonth ? '' : 'opacity-45'
                } ${isSelected ? 'bg-accentsoft' : dropTarget === cell.iso ? 'bg-sunk' : 'hover:bg-sunk'}`}
              >
                <span
                  className={`mono grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] ${
                    isToday ? 'bg-accent text-accentfg' : isSelected ? 'text-accent' : 'text-muted'
                  }`}
                >
                  {cell.day}
                </span>

                <span className="flex flex-col gap-0.5 overflow-hidden">
                  {list.slice(0, 3).map((t) => (
                    <Chip key={t.id} task={t} onPick={onSelectDay} />
                  ))}
                  {list.length > 3 && (
                    <span className="hidden px-1 text-[10px] text-faint sm:block">+{list.length - 3} more</span>
                  )}
                </span>

                {list.length > 0 && (
                  <span className="mt-auto flex gap-0.5 sm:hidden" aria-hidden="true">
                    {list.slice(0, 4).map((t) => (
                      <span key={t.id} className="h-1.5 w-1.5 rounded-full" style={{ background: chipColor(t) }} />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {unscheduled.length > 0 && (
        <div
          className="rounded-xl border border-dashed border-line px-3 py-2.5"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const id = Number(e.dataTransfer.getData('text/plain'))
            if (id) onReschedule(id, null)
          }}
        >
          <p className="text-[12px] text-faint">
            Unscheduled — drag onto a day to give it a date, or drop one back here to clear it
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {unscheduled.map((t) => (
              <span
                key={t.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', String(t.id))
                  e.dataTransfer.effectAllowed = 'move'
                }}
                className="cursor-grab rounded-full border border-line bg-panel px-2.5 py-1 text-[12px] text-muted active:cursor-grabbing"
              >
                {t.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
