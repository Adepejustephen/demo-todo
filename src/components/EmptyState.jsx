export default function EmptyState({ title, hint }) {
  return (
    <div className="bg-panel px-6 py-16 text-center">
      <p className="disp text-[15px] font-semibold">{title}</p>
      <p className="mt-1.5 text-[13px] text-muted">{hint}</p>
    </div>
  )
}
