import { useCallback, useEffect, useMemo, useState } from 'react'
import { daysFromToday } from './lib/dates.js'
import { loadState, saveState } from './lib/storage.js'
import { parseInput } from './lib/parse.js'

/** Owns the task list, the lists themselves, and every action the UI can take. */
export function useTasks() {
  const [state, setState] = useState(loadState)
  const { tasks, lists } = state

  useEffect(() => {
    saveState(state)
  }, [state])

  const patch = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), [])

  const addTask = useCallback(
    (text, { due: dueOverride, fallbackList } = {}) => {
      const parsed = parseInput(text, lists)
      if (!parsed.title) return false
      const list = parsed.list || fallbackList || 'inbox'
      patch((s) => ({
        tasks: [
          {
            id: Date.now(),
            title: parsed.title,
            list,
            due: dueOverride || parsed.due || null,
            priority: parsed.priority,
            done: false,
          },
          ...s.tasks,
        ],
      }))
      return true
    },
    [lists, patch],
  )

  const toggleTask = useCallback(
    (id) => patch((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
    [patch],
  )

  const removeTask = useCallback(
    (id) => patch((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
    [patch],
  )

  const renameTask = useCallback(
    (id, title) => patch((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, title } : t)) })),
    [patch],
  )

  /** Cycles none -> P1 -> P2 -> P3 -> none. */
  const cyclePriority = useCallback(
    (id) =>
      patch((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, priority: (t.priority + 1) % 4 } : t)) })),
    [patch],
  )

  const clearDone = useCallback(() => patch((s) => ({ tasks: s.tasks.filter((t) => !t.done) })), [patch])

  const moveTask = useCallback(
    (dragId, targetId) => {
      if (dragId == null || dragId === targetId) return
      patch((s) => {
        const next = [...s.tasks]
        const from = next.findIndex((t) => t.id === dragId)
        const to = next.findIndex((t) => t.id === targetId)
        if (from < 0 || to < 0) return {}
        const [moved] = next.splice(from, 1)
        next.splice(to, 0, moved)
        return { tasks: next }
      })
    },
    [patch],
  )

  /** Returns the new list's id so the caller can switch to it. */
  const addList = useCallback(
    (name) => {
      const clean = name.trim()
      if (!clean) return null
      const id =
        clean
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `list-${Date.now()}`
      if (!lists.some((l) => l.id === id)) {
        patch((s) => ({ lists: [...s.lists, { id, name: clean }] }))
      }
      return id
    },
    [lists, patch],
  )

  const counts = useMemo(() => {
    const open = tasks.filter((t) => !t.done)
    const c = { today: 0, upcoming: 0, all: open.length, done: tasks.length - open.length }
    open.forEach((t) => {
      if (!t.due) return
      if (daysFromToday(t.due) <= 0) c.today += 1
      else c.upcoming += 1
    })
    lists.forEach((l) => {
      c[l.id] = open.filter((t) => t.list === l.id).length
    })
    return c
  }, [tasks, lists])

  const overdue = useMemo(
    () => tasks.filter((t) => !t.done && t.due && daysFromToday(t.due) < 0).length,
    [tasks],
  )

  return {
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
  }
}

/** Filters and orders the tasks for the view on screen. Done tasks sink to the bottom. */
export function selectVisible(tasks, view, query, showDone) {
  const q = query.trim().toLowerCase()
  const matches = tasks.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q)) return false
    if (view === 'today') return !t.done && t.due && daysFromToday(t.due) <= 0
    if (view === 'upcoming') return !t.done && t.due && daysFromToday(t.due) > 0
    if (view === 'done') return t.done
    if (view === 'all') return showDone || !t.done
    return t.list === view && (showDone || !t.done)
  })
  return [...matches].sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1))
}
