# Open Loops

A daily to-do app: lists, due dates, priorities, and a quick-add box that reads plain language.

Built with React 18, Vite and Tailwind CSS v4. Everything is stored in the browser's
`localStorage` — no account, no server.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production bundle in dist/
npm run preview  # serve that bundle
npm test         # date + quick-add parsing tests
```

## Quick add

Type one line and the parser takes out what it recognises, leaving the rest as the title:

| You type | It understands |
| --- | --- |
| `Email Sam tomorrow !1 #work` | due tomorrow, priority 1, filed under Work |
| `Pay rent on friday` | the next Friday |
| `Plan the trip next week` | seven days out |
| `Water the plants in 3 days` | three days out |
| `Call the plumber` | no date — lands in the current list |

`!1`–`!3` set priority (shown as a coloured stripe on the row), `#list` files it in an
existing list, and `today` / `tonight` / `tomorrow` / a weekday name / `next week` /
`in N days` set the date. Anything the parser misses can be set with the date field.

## Around the app

- **Views** — Today (includes anything overdue), Upcoming, Everything, Done, plus your own lists.
- **Tabs** — every view draws as a **List** or a **Calendar**.
- **Calendar** — a month of due dates with the day's tasks underneath. Pick a day and new
  tasks land on it; drag a task onto another day to reschedule it, or drop it in the
  Unscheduled tray to clear its date. Colours follow priority, and anything late turns red.
  On phones each day shows dots instead of labels, and tapping a day lists its tasks.
- **Rows** — tick to complete, double-click to rename, drag to reorder, cycle P1–P3, delete.
- **Keyboard** — `n` focuses quick add, `/` focuses search, `l` and `c` switch tabs,
  `Esc` cancels a rename.
- **Theme** — follows the OS by default; the Theme button overrides it for the session.

## Layout

```
src/
  App.jsx              views, filtering and page layout
  useTasks.js          task/list state, actions, and the visible-task selector
  index.css            colour tokens (light + dark), fonts, keyframes
  components/          Composer, Sidebar, TaskRow, Check, DueChip, EmptyState, ThemeToggle
  lib/
    dates.js           local-calendar date maths, labels and the month grid
    parse.js           the quick-add parser
    parse.test.js      tests for both
    storage.js         localStorage load/save (guarded) and the seed tasks
```

Colours are CSS custom properties defined in `src/index.css` and exposed to Tailwind
through `@theme inline`, so `bg-panel`, `text-muted` and friends follow the theme.
