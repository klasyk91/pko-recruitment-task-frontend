import { describe, it, expect } from 'vitest'
import { formatDate } from '~/utils/comments'

describe('formatDate', () => {
  it('formats ISO date in Polish format', () => {
    expect(formatDate('2026-11-20T10:00:00Z')).toBe('20.11.2026')
  })

  it('uses Europe/Warsaw time zone near midnight', () => {
    expect(formatDate('2026-11-20T23:30:00Z')).toBe('21.11.2026')
  })

  it('returns empty string for invalid date', () => {
    expect(formatDate('wrong-or-missing-date')).toBe('')
  })
})
