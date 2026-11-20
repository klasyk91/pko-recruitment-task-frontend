import type { VueWrapper } from '@vue/test-utils'
import type { Comment } from '~/utils/comments'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearNuxtData, createError } from '#imports'
import CommentsSection from '~/components/CommentsSection.vue'

const COMMENTS: Comment[] = [
  {
    id: '1',
    photoId: '1',
    author: 'Piotr Nowak',
    avatar: 'https://i.pravatar.cc/100?img=12',
    content: 'Starszy komentarz.',
    createdAt: '2026-08-15T09:23:11Z',
  },
  {
    id: '2',
    photoId: '1',
    author: 'Marta Lewandowska',
    avatar: 'https://i.pravatar.cc/100?img=5',
    content: 'Nowszy komentarz.',
    createdAt: '2026-08-16T14:45:30Z',
  },
  {
    id: '3',
    photoId: '2',
    author: 'Anna Kowalska',
    avatar: 'https://i.pravatar.cc/100?img=23',
    content: 'Komentarz do drugiego zdjęcia.',
    createdAt: '2026-06-06T11:06:30Z',
  },
]

// Odpowiedź pozostaje taka, jaką ustawi test. Błąd musi się utrzymywać, dopóki
// test go nie wyłączy, bo `$fetch` ponawia nieudane żądanie GET jeden raz.
let respond: () => unknown
registerEndpoint('/api/comments.json', () => respond())

let wrapper: VueWrapper

async function mountSection(photoId: string) {
  wrapper = await mountSuspended(CommentsSection, {
    props: { photoId },
    attachTo: document.body,
  })
}

function find(testId: string) {
  return wrapper.find(`[data-testid="${testId}"]`)
}

function authors() {
  return wrapper.findAll('[data-testid="photo-comment-author"]').map(author => author.text())
}

describe('commentsSection', () => {
  beforeEach(() => {
    respond = () => COMMENTS
  })

  afterEach(() => {
    wrapper?.unmount()
    // Klucz fetcha jest współdzielony, więc jego dane przeciekłyby do następnego testu.
    clearNuxtData()
  })

  it('pokazuje stan ładowania, dopóki nie przyjdzie odpowiedź', async () => {
    let release: ((comments: Comment[]) => void) | undefined
    respond = () => new Promise<Comment[]>((resolve) => {
      release = resolve
    })

    await mountSection('1')
    expect(find('photo-comments-loading').exists()).toBe(true)

    await vi.waitFor(() => expect(release).toBeDefined())
    release!(COMMENTS)

    await vi.waitFor(() => expect(find('photo-comments-list').exists()).toBe(true))
    expect(find('photo-comments-loading').exists()).toBe(false)
  })

  it('wyświetla komentarze do zdjęcia od najnowszego do najstarszego wraz z ich liczbą', async () => {
    await mountSection('1')

    await vi.waitFor(() => expect(authors()).toEqual(['Marta Lewandowska', 'Piotr Nowak']))
    expect(find('photo-comments-count').text()).toBe('2')
    expect(wrapper.get('[role="status"]').text()).toBe('Liczba komentarzy: 2')
  })

  it('pokazuje stan, gdy zdjęcie nie ma komentarzy', async () => {
    respond = () => []

    await mountSection('1')

    await vi.waitFor(() => expect(find('photo-comments-empty').exists()).toBe(true))
    expect(find('photo-comments-empty').text()).toBe('Brak komentarzy do tego zdjęcia.')
    expect(find('photo-comments-count').exists()).toBe(false)
  })

  it('pokazuje błąd i po ponowieniu wyświetla komentarze', async () => {
    respond = () => {
      throw createError({ statusCode: 500 })
    }

    await mountSection('1')

    await vi.waitFor(() => expect(find('photo-comments-error').exists()).toBe(true))
    expect(wrapper.get('[role="alert"]').text()).toBe('Nie udało się pobrać komentarzy.')
    expect(find('photo-comments-list').exists()).toBe(false)
    expect(find('photo-comments-count').exists()).toBe(false)

    respond = () => COMMENTS
    await find('photo-comments-retry').trigger('click')

    await vi.waitFor(() => expect(authors()).toEqual(['Marta Lewandowska', 'Piotr Nowak']))
    expect(find('photo-comments-error').exists()).toBe(false)
  })

  it('przełącza listę po zmianie zdjęcia bez wysyłania nowego żądania', async () => {
    const handler = vi.fn(() => COMMENTS)
    respond = handler

    await mountSection('1')
    await vi.waitFor(() => expect(authors()).toHaveLength(2))

    await wrapper.setProps({ photoId: '2' })

    expect(authors()).toEqual(['Anna Kowalska'])
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
