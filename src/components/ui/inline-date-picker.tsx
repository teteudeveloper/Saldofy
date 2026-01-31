"use client"

import { useMemo, useState } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function toISODate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function fromISODate(value: string) {
  if (!value) return null
  const [y, m, d] = value.split("-").map((v) => Number(v))
  if (!y || !m || !d) return null
  const date = new Date(y, m - 1, d)
  if (Number.isNaN(date.getTime())) return null
  return date
}

const weekdayLabels = ["D", "S", "T", "Q", "Q", "S", "S"]
const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

export function InlineDatePicker({
  id,
  value,
  onChange,
  disabled,
  placeholder = "Selecione uma data",
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  const selectedDate = useMemo(() => fromISODate(value), [value])
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<Date>(() => selectedDate ?? new Date())

  const grid = useMemo(() => {
    const year = view.getFullYear()
    const month = view.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    const startDay = firstOfMonth.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: Array<Date | null> = []
    for (let i = 0; i < startDay; i++) cells.push(null)
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day))
    while (cells.length < 42) cells.push(null)
    return cells
  }, [view])

  const displayValue = useMemo(() => {
    if (!selectedDate) return ""
    return selectedDate.toLocaleDateString("pt-BR")
  }, [selectedDate])

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          value={displayValue}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          className="pr-10"
        />
        <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {open && !disabled && (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setView((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              {monthNames[view.getMonth()]} {view.getFullYear()}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setView((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {weekdayLabels.map((w, idx) => (
              <div key={`${w}-${idx}`} className="py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((date, idx) => {
              if (!date) return <div key={idx} className="h-9" />

              const iso = toISODate(date)
              const isSelected = value === iso
              const isToday = iso === toISODate(new Date())

              return (
                <Button
                  key={idx}
                  type="button"
                  variant="ghost"
                  className={cn(
                    "h-9 px-0",
                    isSelected &&
                      "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                    !isSelected && isToday && "border border-border"
                  )}
                  onClick={() => {
                    onChange(iso)
                    setOpen(false)
                  }}
                >
                  {date.getDate()}
                </Button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                const today = new Date()
                const iso = toISODate(today)
                onChange(iso)
                setView(today)
                setOpen(false)
              }}
            >
              Hoje
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

