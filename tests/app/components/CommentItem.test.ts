import type { Comment } from '~/utils/comments'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import CommentItem from '~/components/CommentItem.vue'

const comment: Comment = {
  id: '4866',
  photoId: '1',
  author: 'Marta Lewandowska',
  avatar: 'https://i.pravatar.cc/100?img=5',
  content: 'Wow, klimat tego miejsca jest niepowtarzalny.',
  createdAt: '2026-08-16T14:45:30Z',
}

describe('commentItem', () => {
  it('renderuje autora, treść i datę', async () => {
    const wrapper = await mountSuspended(CommentItem, { props: { comment } })

    expect(wrapper.get('[data-testid="photo-comment-author"]').text()).toBe('Marta Lewandowska')
    expect(wrapper.get('[data-testid="photo-comment-content"]').text()).toBe(comment.content)

    const date = wrapper.get('time')
    expect(date.attributes('datetime')).toBe('2026-08-16T14:45:30Z')
    expect(date.text()).toBe('16.08.2026')

    const avatar = wrapper.get('img')
    expect(avatar.attributes('src')).toBe(comment.avatar)
    // Awatar jest dekoracyjny — imię autora stoi obok, więc czytnik nie powinien go odczytywać.
    expect(avatar.attributes('alt')).toBe('')
  })

  it('pokazuje inicjał autora, gdy awatar nie załaduje się', async () => {
    const wrapper = await mountSuspended(CommentItem, { props: { comment } })
    expect(wrapper.find('[data-testid="photo-comment-avatar-fallback"]').exists()).toBe(false)

    await wrapper.get('img').trigger('error')

    expect(wrapper.get('[data-testid="photo-comment-avatar-fallback"]').text()).toBe('M')
    expect(wrapper.find('img').exists()).toBe(false)
  })
})
