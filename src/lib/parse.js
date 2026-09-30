import { WEEKDAYS, nextWeekday, shift, todayISO } from './dates.js'

const WEEKDAY_PATTERN = [...WEEKDAYS, 'mon', 'tue', 'tues', 'wed', 'thu', 'thur', 'thurs', 'fri', 'sat', 'sun'].join('|')

/**
 * Pull a due date, priority and list out of a typed line, and return the
 * remaining words as the task title.
 *
 *   "Email Sam tomorrow !1 #work"
 *     -> { title: 'Email Sam', due: <tomorrow>, priority: 1, list: 'work' }
 *
 * Understands: today, tonight, tomorrow, next week, in N days, a weekday name,
 * !1-!3 for priority, #list to file it (only lists that already exist).
 */
export function parseInput(raw, lists = []) {
  let text = ` ${raw} `
  let due = null
  let priority = 0
  let list = null

  const take = (re, fn) => {
    const m = text.match(re)
    if (!m) return false
    fn(m)
    text = text.replace(m[0], ' ')
    return true
  }

  take(/\s#([a-z0-9-]+)/i, (m) => {
    const key = m[1].toLowerCase()
    const hit = lists.find((l) => l.id === key || l.name.toLowerCase() === key)
    if (hit) list = hit.id
  })

  take(/\s!([1-3])\b/, (m) => {
    priority = Number(m[1])
  })

  // First date phrase wins, so "tomorrow" in a title doesn't also match a weekday.
  take(/\s(today|tonight)\b/i, () => {
    due = todayISO()
  }) ||
    take(/\stomorrow\b/i, () => {
      due = shift(1)
    }) ||
    take(/\snext week\b/i, () => {
      due = shift(7)
    }) ||
    take(/\sin (\d{1,3}) days?\b/i, (m) => {
      due = shift(Number(m[1]))
    }) ||
    take(new RegExp(`\\s(?:on |next )?(${WEEKDAY_PATTERN})\\b`, 'i'), (m) => {
      const word = m[1].toLowerCase()
      const idx = WEEKDAYS.findIndex((d) => d.startsWith(word.slice(0, 3)))
      if (idx >= 0) due = nextWeekday(idx)
    })

  return { title: text.replace(/\s+/g, ' ').trim(), due, priority, list }
}
