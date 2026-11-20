<script setup lang="ts">
import type { Comment } from '~/utils/comments'

const props = defineProps<{
  comment: Comment
}>()

const hasAvatarFailed = ref(false)

const authorInitial = computed(() => props.comment.author.charAt(0).toUpperCase())
</script>

<template>
  <article
    class="flex gap-3 sm:gap-4"
    data-testid="photo-comment"
  >
    <span
      v-if="hasAvatarFailed"
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-700"
      aria-hidden="true"
      data-testid="photo-comment-avatar-fallback"
    >
      {{ authorInitial }}
    </span>
    <img
      v-else
      :src="comment.avatar"
      alt=""
      width="40"
      height="40"
      loading="lazy"
      referrerpolicy="no-referrer"
      class="h-10 w-10 shrink-0 rounded-full bg-gray-200 object-cover"
      @error="hasAvatarFailed = true"
    >
    <div class="min-w-0">
      <p class="m-0 flex flex-wrap items-baseline gap-x-2">
        <span
          class="break-words font-semibold text-gray-800"
          data-testid="photo-comment-author"
        >
          {{ comment.author }}
        </span>
        <time
          :datetime="comment.createdAt"
          class="text-sm text-gray-500"
          data-testid="photo-comment-date"
        >
          {{ formatDate(comment.createdAt) }}
        </time>
      </p>
      <p
        class="m-0 mt-1 break-words text-gray-800"
        data-testid="photo-comment-content"
      >
        {{ comment.content }}
      </p>
    </div>
  </article>
</template>
