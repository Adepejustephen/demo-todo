import { useState } from 'react'
import { shift, todayISO } from '../lib/dates.js'

/** The quick-add box: one line of plain language, plus a date field for anything it can't guess. */
export default function Composer({ inputRef, onAdd }) {
  const [text, setText] = useState('')
  const [due, setDue] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    if (onAdd(text, due || null)) {
      setText('')
      setDue('')
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-3">
      <input
        ref={inputRef}
        id="ol-add"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a task — try “Email Sam tomorrow !1 #work”"
        aria-label="Add a task"
        className="w-full bg-transparent px-1 py-1.5 text-[15px] placeholder:text-faint focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="ol-due" className="text-[12px] text-faint">
          Due
        </label>
        <input
          id="ol-due"
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className="rounded-lg border border-line bg-sunk px-2.5 py-1.5 text-[13px] text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setDue(todayISO())}
          className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:text-fg"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setDue(shift(1))}
          className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:text-fg"
        >
          Tomorrow
        </button>
        <button
          type="submit"
          className="ml-auto rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-accentfg transition-opacity hover:opacity-90"
        >
          Add task
        </button>
      </div>
    </form>
  )
}
