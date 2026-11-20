export interface Comment {
  id: string
  photoId: string
  author: string
  avatar: string
  content: string
  createdAt: string
}

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

export function getCommentsForPhoto(comments: Comment[], photoId: string): Comment[] {
  return comments
    .filter(comment => comment.photoId === photoId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
}
