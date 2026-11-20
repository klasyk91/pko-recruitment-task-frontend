<script setup lang="ts">
import type { Comment } from '~/utils/comments'

const props = defineProps<{
  photoId: string
}>()

const { data, status, refresh } = useLazyFetch<Comment[]>('/api/comments.json', {
  key: 'photo-comments',
  server: false,
})

const comments = computed(() => getCommentsForPhoto(data.value ?? [], props.photoId))

// Przy 'server: false' zapytanie rusza dopiero po hydracji, więc 'idle' też
// traktujemy jako ładowanie. Gdy dane już są, odświeżanie nie chowa listy.
const state = computed(() => {
  if (!data.value && (status.value === 'idle' || status.value === 'pending')) {
    return 'loading'
  }
  if (status.value === 'error') {
    return 'error'
  }
  return comments.value.length > 0 ? 'list' : 'empty'
})
</script>

<template>
  <section
    class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    aria-labelledby="comments-heading"
    data-testid="photo-comments"
  >
    <div class="mb-4 flex items-center gap-2">
      <h2
        id="comments-heading"
        class="m-0 text-lg font-semibold"
      >
        Komentarze
      </h2>
      <span
        v-if="state === 'list'"
        class="rounded-full bg-gray-100 px-2 py-0.5 text-sm font-medium text-gray-700"
        aria-hidden="true"
        data-testid="photo-comments-count"
      >
        {{ comments.length }}
      </span>
    </div>

    <div role="status">
      <div
        v-if="state === 'loading'"
        class="flex items-center gap-3 text-gray-500"
        data-testid="photo-comments-loading"
      >
        <span
          class="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"
          aria-hidden="true"
        />
        Ładowanie komentarzy...
      </div>
      <p
        v-else-if="state === 'empty'"
        class="m-0 text-gray-500"
        data-testid="photo-comments-empty"
      >
        Brak komentarzy do tego zdjęcia.
      </p>
      <p
        v-else-if="state === 'list'"
        class="sr-only"
      >
        Liczba komentarzy: {{ comments.length }}
      </p>
    </div>

    <div
      v-if="state === 'error'"
      class="flex flex-col items-start gap-2 text-red-700"
      data-testid="photo-comments-error"
    >
      <p
        class="m-0"
        role="alert"
      >
        Nie udało się pobrać komentarzy.
      </p>
      <button
        type="button"
        class="rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 transition hover:border-blue-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        data-testid="photo-comments-retry"
        @click="refresh()"
      >
        Spróbuj ponownie
      </button>
    </div>

    <ul
      v-else-if="state === 'list'"
      class="m-0 list-none divide-y divide-gray-200 p-0"
      data-testid="photo-comments-list"
    >
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="py-4 first:pt-0 last:pb-0"
      >
        <CommentItem :comment="comment" />
      </li>
    </ul>
  </section>
</template>
