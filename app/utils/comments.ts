const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Europe/Warsaw',
})

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)

  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date)
}
