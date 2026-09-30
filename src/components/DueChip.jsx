import { daysFromToday, dueLabel } from '../lib/dates.js'

export default function DueChip({ due, done }) {
  if (!due) return null
  const n = daysFromToday(due)
  const tone = done
    ? 'var(--faint)'
    : n < 0
      ? 'var(--late)'
      : n === 0
        ? 'var(--due)'
        : 'var(--muted)'
  return (
    <span className="mono text-[12px]" style={{ color: tone }}>
      {dueLabel(due)}
    </span>
  )
}
