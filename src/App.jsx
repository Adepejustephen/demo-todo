import { useEffect, useMemo, useRef, useState } from 'react'
import Composer from './components/Composer.jsx'
import EmptyState from './components/EmptyState.jsx'
import Sidebar from './components/Sidebar.jsx'
import TaskRow from './components/TaskRow.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { selectVisible, useTasks } from './useTasks.js'

const EMPTY = {
  today: ['Nothing due today', 'Add something above, or pull one forward from Upcoming.'],
  upcoming: ['Nothing scheduled', 'Tasks dated later than today show up here.'],
  done: ['Nothing finished yet', 'Completed tasks collect here so you can look back.'],
  all: ['Your list is empty', 'Type a task above and press Enter.'],
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function App() {
  const {
    tasks,
    lists,
    counts,
    overdue,
    addTask,
    toggleTask,
    removeTask,
    renameTask,
    cyclePriority,
    clearDone,
    moveTask,
    addList,
  } = useTasks()

  const [view, setView] = useState('today')
  const [query, setQuery] = useState('')
  const [showDone, setShowDone] = useState(true)
  const [dragId, setDragId] = useState(null)
  const addRef = useRef(null)
  const searchRef = useRef(null)

  // n adds, / searches — but never while the caret is already in a field.
  useEffect(() => {
    function onKey(e) {
      const tag = (e.target.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'n') {
        e.preventDefault()
        addRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const views = [
    { id: 'today', label: 'Today', count: counts.today },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'all', label: 'Everything', count: counts.all },
    { id: 'done', label: 'Done', count: counts.done },
  ]

  const visible = useMemo(() => selectVisible(tasks, view, query, showDone), [tasks, view, query, showDone])

  const heading = views.find((v) => v.id === view)?.label ?? lists.find((l) => l.id === view)?.name ?? 'Today'
  const [emptyTitle, emptyHint] = EMPTY[view] ?? [
    'This list is empty',
    'Add a task while this list is open and it lands here.',
  ]
  const isSmartView = view === 'done' || view === 'today' || view === 'upcoming'

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="disp text-[26px] leading-none font-bold tracking-tight sm:text-[30px]">Open Loops</h1>
          <p className="mt-1.5 text-[13px] text-muted">
            {greeting()}. {counts.today ? `${counts.today} due today` : 'Nothing due today'}
            {overdue > 0 && <span className="text-late">, {overdue} running late</span>}
            {counts.done > 0 && <span className="text-faint"> · {counts.done} done</span>}
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-col gap-5 md:flex-row">
        <Sidebar
          views={views}
          lists={lists}
          counts={counts}
          view={view}
          setView={setView}
          onAddList={addList}
        />

        <main className="flex min-w-0 flex-1 flex-col gap-4">
          <Composer
            inputRef={addRef}
            onAdd={(text, due) =>
              addTask(text, { due, fallbackList: lists.some((l) => l.id === view) ? view : 'inbox' })
            }
          />

          <div className="flex flex-wrap items-center gap-2">
            <h2 className="disp text-[17px] font-semibold">{heading}</h2>
            <span className="mono text-[12px] text-faint">{visible.length}</span>

            <div className="ml-auto flex items-center gap-2">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search  /"
                aria-label="Search tasks"
                className="w-32 rounded-lg border border-line bg-panel px-3 py-1.5 text-[13px] placeholder:text-faint focus:border-accent focus:outline-none sm:w-48"
              />
              {!isSmartView && (
                <button
                  type="button"
                  onClick={() => setShowDone((v) => !v)}
                  className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:text-fg"
                >
                  {showDone ? 'Hide done' : 'Show done'}
                </button>
              )}
              {view === 'done' && counts.done > 0 && (
                <button
                  type="button"
                  onClick={clearDone}
                  className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:text-late"
                >
                  Clear done
                </button>
              )}
            </div>
          </div>

          <section className="overflow-hidden rounded-xl border border-line">
            {visible.length ? (
              <ul>
                {visible.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    lists={lists}
                    onToggle={toggleTask}
                    onRemove={removeTask}
                    onRename={renameTask}
                    onCyclePriority={cyclePriority}
                    dragId={dragId}
                    setDragId={setDragId}
                    onDrop={(targetId) => moveTask(dragId, targetId)}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState title={emptyTitle} hint={emptyHint} />
            )}
          </section>

          <p className="text-[12px] leading-relaxed text-faint">
            Quick add understands <span className="mono">tomorrow</span>, <span className="mono">friday</span>,{' '}
            <span className="mono">next week</span>, <span className="mono">in 3 days</span>,{' '}
            <span className="mono">!1</span>–<span className="mono">!3</span> for priority and{' '}
            <span className="mono">#list</span> to file it. Drag rows to reorder, double-click to rename. Press{' '}
            <span className="mono">n</span> to add, <span className="mono">/</span> to search. Everything is saved
            in this browser.
          </p>
        </main>
      </div>
    </div>
  )
}
