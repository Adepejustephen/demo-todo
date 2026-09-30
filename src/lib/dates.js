const pad = (n) => String(n).padStart(2, '0')

/** Local-calendar ISO date (YYYY-MM-DD). Avoids the UTC shift of toISOString(). */
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const todayISO = () => iso(new Date())

/** ISO date `days` from today; negative values go backwards. */
export function shift(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return iso(d)
}

/** The next occurrence of a weekday (0 = Sunday). Today never counts — "friday" on a Friday means next Friday. */
export function nextWeekday(target) {
  const d = new Date()
  let delta = (target - d.getDay() + 7) % 7
  if (delta === 0) delta = 7
  d.setDate(d.getDate() + delta)
  return iso(d)
}

/** Whole days between today and an ISO date: negative is overdue, 0 is today. */
export function daysFromToday(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const then = new Date(y, m - 1, d)
  then.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((then - now) / 86400000)
}

export const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

/** How a due date reads in the list: Today, Tomorrow, Friday, 3 days late, Oct 14. */
export function dueLabel(dateStr) {
  const n = daysFromToday(dateStr)
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  if (n === -1) return 'Yesterday'
  if (n < 0) return `${Math.abs(n)} days late`
  if (n < 7) {
    const name = WEEKDAYS[new Date(`${dateStr}T00:00:00`).getDay()]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function fromISO(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Month cursors are plain { y, m } pairs; m is 0-based. */
export function addMonths({ y, m }, n) {
  const d = new Date(y, m + n, 1)
  return { y: d.getFullYear(), m: d.getMonth() }
}

export function thisMonth() {
  const d = new Date()
  return { y: d.getFullYear(), m: d.getMonth() }
}

export function monthLabel({ y, m }) {
  return new Date(y, m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * A Monday-start grid of whole weeks covering the month, including the
 * neighbouring days that fill the first and last rows. A trailing row that
 * falls entirely outside the month is dropped, so short months don't leave
 * an empty band.
 */
export function monthGrid({ y, m }) {
  const offset = (new Date(y, m, 1).getDay() + 6) % 7
  const cells = []
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(y, m, 1 - offset + i)
    cells.push({ iso: iso(d), day: d.getDate(), inMonth: d.getMonth() === m && d.getFullYear() === y })
  }
  const lastWeek = cells.slice(35)
  return lastWeek.some((c) => c.inMonth) ? cells : cells.slice(0, 35)
}
