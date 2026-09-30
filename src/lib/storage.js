import { shift, todayISO } from './dates.js'

const KEY = 'openloops.v1'

export const DEFAULT_LISTS = [
  { id: 'inbox', name: 'Inbox' },
  { id: 'work', name: 'Work' },
  { id: 'home', name: 'Home' },
]

/** Example tasks, so a first run opens in a working state rather than empty. */
const seed = () => [
  { id: 1, title: 'Send the quarterly update to the team', list: 'work', due: todayISO(), priority: 1, done: false },
  { id: 2, title: 'Review the two open pull requests', list: 'work', due: todayISO(), priority: 2, done: false },
  { id: 3, title: 'Book the dentist', list: 'home', due: shift(-2), priority: 2, done: false },
  { id: 4, title: 'Groceries: coffee, oats, olive oil', list: 'home', due: shift(1), priority: 0, done: false },
  { id: 5, title: 'Draft the workshop outline', list: 'work', due: shift(4), priority: 0, done: false },
  { id: 6, title: 'Call the letting agent back', list: 'inbox', due: null, priority: 0, done: false },
  { id: 7, title: 'Renew the travel insurance', list: 'home', due: todayISO(), priority: 0, done: true },
]

/** Storage can be unavailable (private windows, blocked site data), so every access is guarded. */
export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.tasks) && Array.isArray(parsed.lists) && parsed.lists.length) {
        return parsed
      }
    }
  } catch {
    /* fall through to the seed */
  }
  return { tasks: seed(), lists: DEFAULT_LISTS }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* nothing to do: the session still works, it just won't persist */
  }
}
