<script setup lang="ts">
import { timeAgo } from '~/composables/useEventTypes'
import type { WarpulseEvent } from '~/composables/useEvents'
import { parseTwitterUrl } from '~/composables/useTwitter'

definePageMeta({ layout: 'archive' })

const route = useRoute()
const { call } = useEdge()

const id = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const loading = ref(true)
const event = ref<WarpulseEvent | null>(null)
const discussions = ref<{ id: string; content: string; created_at: string }[]>([])
const discBusy = ref(false)
const newComment = ref('')
const commentBusy = ref(false)
const commentOk = ref(false)
const commentErr = ref<string | null>(null)
const copied = ref(false)
const copiedTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const isX = (url?: string | null) => !!parseTwitterUrl(url ?? '')

const load = async () => {
  if (!id.value) return
  loading.value = true
  try {
    event.value = await call<WarpulseEvent>(`/events/${id.value}`)
    discBusy.value = true
    discussions.value = await call('/discussions', { query: { eventId: id.value } })
  } finally {
    discBusy.value = false
    loading.value = false
  }
}

watch(id, () => load(), { immediate: true })

const copyLink = async () => {
  if (!event.value || !import.meta.client) return
  const url = `${window.location.origin}/event/${event.value.id}`
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    const el = document.createElement('textarea')
    el.value = url
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    el.remove()
  }
  copied.value = true
  if (copiedTimer.value) clearTimeout(copiedTimer.value)
  copiedTimer.value = setTimeout(() => copied.value = false, 1800)
}

const sendComment = async () => {
  if (!event.value || !newComment.value.trim()) return
  commentErr.value = null
  commentBusy.value = true
  try {
    await call('/discussions', { method: 'POST', body: { event_id: event.value.id, content: newComment.value.trim() } })
    commentOk.value = true
    newComment.value = ''
    setTimeout(() => commentOk.value = false, 3000)
  } catch (e: unknown) {
    commentErr.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed'
  } finally {
    commentBusy.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-end justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-[14px] font-semibold text-ink">Archive</h1>
        <p class="text-[12px] text-muted mt-0.5">Event detail (map-free).</p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink to="/archive" class="btn-ghost text-[12px] py-2 px-3 rounded-lg">Back</NuxtLink>
        <NuxtLink v-if="event" :to="`/event/${event.id}`" class="btn-primary text-[12px] py-2 px-3 rounded-lg">Open on map</NuxtLink>
      </div>
    </div>

    <div v-if="loading" class="bg-card border border-border rounded-2xl p-6 text-[12px] text-muted">Loading...</div>

    <div v-else-if="!event" class="bg-card border border-border rounded-2xl p-6 text-[12px] text-muted">Not found.</div>

    <div v-else class="bg-card border border-border rounded-2xl overflow-hidden">
      <div class="px-5 py-4 border-b border-border">
        <div class="flex items-center gap-2 flex-wrap">
          <EventTypeTag :type="event.event_type" />
          <AiVerifiedBadge v-if="event.ai_verified" />
          <span class="ml-auto text-[11px] text-muted tabular-nums">{{ timeAgo(event.created_at) }}</span>
        </div>
        <div class="mt-2 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-[16px] font-semibold text-ink leading-snug">{{ event.title }}</h2>
            <p v-if="event.location_name" class="text-[12px] text-muted mt-1">📍 {{ event.location_name }}</p>
          </div>
          <button class="text-[12px] font-medium text-dim hover:text-ink transition-colors whitespace-nowrap" @click="copyLink">
            {{ copied ? 'Copied' : 'Copy link' }}
          </button>
        </div>
      </div>

      <div class="px-5 py-4 space-y-3">
        <p v-if="event.description" class="text-[13px] text-dim leading-relaxed">{{ event.description }}</p>

        <TwitterCard v-if="isX(event.source_url)" :url="event.source_url!" />
        <a v-else-if="event.source_url" :href="event.source_url" target="_blank" rel="noopener"
           class="inline-flex items-center gap-1 text-[12px] text-dim hover:text-ink transition-colors">
          View source ↗
        </a>
      </div>

      <div class="px-5 py-4 border-t border-border">
        <p class="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2.5">Discussion</p>
        <div v-if="discBusy" class="text-[12px] text-muted">Loading...</div>
        <div v-else-if="!discussions.length" class="text-[12px] text-muted mb-3">No comments yet.</div>
        <div v-else class="space-y-2 mb-3">
          <div v-for="d in discussions" :key="d.id" class="bg-surface rounded-lg px-3 py-2 border border-border">
            <p class="text-[13px] text-ink leading-relaxed">{{ d.content }}</p>
            <p class="text-[11px] text-muted mt-0.5">{{ timeAgo(d.created_at) }}</p>
          </div>
        </div>

        <div class="bg-surface rounded-xl border border-border p-2.5">
          <textarea v-model="newComment" rows="2" placeholder="Add to the discussion..."
            class="w-full text-[13px] bg-transparent focus:outline-none placeholder:text-muted resize-none text-ink leading-relaxed" />
          <p v-if="commentErr" class="text-[11px] text-red-500 mb-1">{{ commentErr }}</p>
          <p v-if="commentOk" class="text-[11px] text-emerald-600 mb-1">Submitted for review!</p>
          <div class="flex justify-end">
            <button class="btn-primary text-[12px] py-2 px-3 rounded-lg" :disabled="commentBusy || !newComment.trim()" @click="sendComment">
              {{ commentBusy ? '...' : 'Send' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
