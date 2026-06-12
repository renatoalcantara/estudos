interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
}

/**
 * Controle segmentado com indicador (thumb) que desliza suavemente entre as
 * opções via transform (animação composta, 60fps).
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="relative flex w-full rounded-full border border-border bg-surface p-1"
    >
      {/* thumb deslizante */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1 left-1 top-1 rounded-full bg-text shadow-soft transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
              active ? 'text-bg' : 'text-text-soft hover:text-text'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
