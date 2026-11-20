import type { Comment } from '~/types/comment'
import { describe, expect, it } from 'vitest'
import { formatDate, getCommentsForPhoto } from '~/utils/comments'

function comment(id: string, photoId: string, createdAt: string): Comment {
  return {
    id,
    photoId,
    author: `Autor ${id}`,
    avatar: `https://i.pravatar.cc/100?img=${id}`,
    content: `Treść ${id}`,
    createdAt,
  }
}

describe('formatDate', () => {
  it('formatuje datę ISO w polskim formacie', () => {
    expect(formatDate('2026-11-20T10:00:00Z')).toBe('20.11.2026')
  })

  it('używa strefy czasowej Europe/Warsaw w okolicach północy', () => {
    expect(formatDate('2026-11-20T23:30:00Z')).toBe('21.11.2026')
  })

  it('zwraca pusty tekst dla niepoprawnej daty', () => {
    expect(formatDate('wrong-or-missing-date')).toBe('')
  })
})

describe('getCommentsForPhoto', () => {
  const comments = [
    comment('1', '1', '2026-08-14T16:30:45Z'),
    comment('2', '2', '2026-08-20T10:00:00Z'),
    comment('3', '1', '2026-08-16T14:45:30Z'),
    comment('4', '1', '2026-08-15T09:23:11Z'),
  ]

  it('zwraca tylko komentarze do wskazanego zdjęcia, od najnowszego', () => {
    expect(getCommentsForPhoto(comments, '1').map(c => c.id)).toEqual(['3', '4', '1'])
  })

  it('zwraca pustą listę dla zdjęcia bez komentarzy', () => {
    expect(getCommentsForPhoto(comments, '999')).toEqual([])
  })

  it('nie modyfikuje przekazanej tablicy', () => {
    const ids = comments.map(c => c.id)

    getCommentsForPhoto(comments, '1')

    expect(comments.map(c => c.id)).toEqual(ids)
  })
})
