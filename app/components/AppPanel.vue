<script setup lang="ts">
import { EVENT_TYPES, timeAgo } from '~/composables/useEventTypes'
import { parseTwitterUrl } from '~/composables/useTwitter'
import type { WarpulseEvent } from '~/composables/useEvents'

const emit = defineEmits<{ select: [event: WarpulseEvent] }>()

const route = useRoute()
const router = useRouter()
const { theme } = useTheme()
const { call } = useEdge()
const { events, sorted, filter, sort, loading, vote, report } = useEvents()

const activeEvent   = ref<WarpulseEvent | null>(null)
const discussions   = ref<{ id: string; content: string; created_at: string }[]>([])
const discBusy      = ref(false)
const newComment    = ref('')
const commentBusy   = ref(false)
const commentOk     = ref(false)
const commentErr    = ref<string | null>(null)
const copied        = ref(false)
const copiedTimer   = ref<ReturnType<typeof setTimeout> | null>(null)
const showReport    = ref<string | null>(null)
const reportReason  = ref('')
const voted         = reactive<Record<string, 'up' | 'down'>>({})
const voteError     = ref<string | null>(null)

const STORAGE_KEY = 'warpulse_votes'
const saveVotes   = () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(voted)) } catch {}
}
onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) Object.assign(voted, JSON.parse(raw))
  } catch {}
})

watch(
  () => events.value.find(e => e.id === activeEvent.value?.id),
  (fresh) => { if (fresh) activeEvent.value = fresh },
)

const typeFilters = [
  { value: 'all', label: 'All' },
  ...Object.entries(EVENT_TYPES).map(([k, v]) => ({ value: k, label: v.label })),
]

const selectEvent = async (event: WarpulseEvent) => {
  if (activeEvent.value?.id === event.id) return
  activeEvent.value = event
  emit('select', event)
  discBusy.value = true
  discussions.value = []
  try {
    discussions.value = await call('/discussions', { query: { eventId: event.id } })
  } finally {
    discBusy.value = false
  }
}

const applyCounterDelta = (ev: WarpulseEvent, dir: 'up' | 'down', delta: 1 | -1) => {
  if (dir === 'up')   ev.upvotes   = Math.max(0, ev.upvotes   + delta)
  else                ev.downvotes = Math.max(0, ev.downvotes + delta)
}

const doVote = async (event: WarpulseEvent, dir: 'up' | 'down') => {
  if (voted[event.id] === dir) return
  voteError.value = null

  const prev = voted[event.id] as 'up' | 'down' | undefined
  voted[event.id] = dir
  saveVotes()

  if (prev) applyCounterDelta(event, prev, -1)
  applyCounterDelta(event, dir, 1)

  try {
    await vote(event.id, dir)
  } catch (e: any) {
    applyCounterDelta(event, dir, -1)
    if (prev) applyCounterDelta(event, prev, 1)

    if (prev) voted[event.id] = prev
    else delete voted[event.id]
    saveVotes()

    const code = e?.data?.error ?? e?.message ?? ''
    voteError.value = code === 'already_voted'
      ? 'You have already voted on this event.'
      : 'Vote failed, please try again.'
    setTimeout(() => { voteError.value = null }, 3000)
  }
}

const doReport = async (id: string) => {
  if (!reportReason.value.trim()) return
  await report(id, reportReason.value.trim())
  showReport.value = null
  reportReason.value = ''
}

const sendComment = async () => {
  if (!activeEvent.value || !newComment.value.trim()) return
  commentErr.value = null
  commentBusy.value = true
  try {
    await call('/discussions', { method: 'POST', body: { event_id: activeEvent.value.id, content: newComment.value.trim() } })
    commentOk.value = true
    newComment.value = ''
    setTimeout(() => commentOk.value = false, 3000)
  } catch (e: unknown) {
    commentErr.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed'
  } finally {
    commentBusy.value = false
  }
}

const backToList = async () => {
  activeEvent.value = null
  discussions.value = []
  await router.push('/map')
}

const copyLink = async () => {
  if (!activeEvent.value || !import.meta.client) return
  const url = `${window.location.origin}/event/${activeEvent.value.id}`
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

const isX = (url?: string | null) => !!parseTwitterUrl(url ?? '')

const routeId = computed(() => typeof route.params.id === 'string' ? route.params.id : null)

watch(routeId, async (id) => {
  if (!id) {
    activeEvent.value = null
    discussions.value = []
    return
  }

  const existing = events.value.find(e => e.id === id)
  if (existing) {
    await selectEvent(existing)
    return
  }

  const fetched = await call<WarpulseEvent>(`/events/${id}`)
  if (!events.value.some(e => e.id === fetched.id))
    events.value.unshift(fetched)
  await selectEvent(fetched)
}, { immediate: true })
</script>

<template>
  <aside class="w-[300px] shrink-0 flex flex-col border-r border-border bg-card overflow-hidden">

    <div class="flex items-center justify-between px-4 h-12 border-b border-border shrink-0">
      <NuxtLink to="/map">
        <img src="/logo.svg" alt="Warpulse" class="h-[22px] w-auto" :class="{ invert: theme === 'dark' }" />
      </NuxtLink>
      <div />
    </div>

    <Transition name="slide" mode="out-in">

        <div v-if="activeEvent" key="detail" class="flex flex-col flex-1 overflow-hidden">
          <div class="px-4 py-3 border-b border-border flex items-start gap-2 shrink-0">
            <button class="text-muted hover:text-ink transition-colors mt-0.5 shrink-0" @click="backToList">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M9 3L5 7.5L9 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <EventTypeTag :type="activeEvent.event_type" />
                <AiVerifiedBadge v-if="activeEvent.ai_verified" />
                <span class="ml-auto text-[11px] text-muted tabular-nums">{{ timeAgo(activeEvent.created_at) }}</span>
              </div>
              <h2 class="text-[13px] font-semibold text-ink leading-snug">{{ activeEvent.title }}</h2>
              <p v-if="activeEvent.location_name" class="text-[11px] text-muted mt-0.5">📍 {{ activeEvent.location_name }}</p>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-4 py-3.5 space-y-3">
            <p v-if="activeEvent.description" class="text-[12.5px] text-dim leading-relaxed">{{ activeEvent.description }}</p>

            <TwitterCard v-if="isX(activeEvent.source_url)" :url="activeEvent.source_url!" />
            <a v-else-if="activeEvent.source_url" :href="activeEvent.source_url" target="_blank" rel="noopener"
               class="inline-flex items-center gap-1 text-[11px] text-dim hover:text-ink transition-colors">
              View source ↗
            </a>

            <Transition name="fade-msg">
              <div v-if="voteError" class="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-md px-2.5 py-1.5">
                {{ voteError }}
              </div>
            </Transition>

            <div class="flex items-center gap-3 pt-1 border-t border-border text-[11px] text-muted">
              <button
                class="flex items-center gap-1 px-1.5 py-1 rounded transition-colors"
                :class="voted[activeEvent.id] === 'up' ? 'text-ink font-semibold' : 'hover:text-ink'"
                @click="doVote(activeEvent, 'up')"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" :fill="voted[activeEvent.id] === 'up' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round">
                  <path d="M5 1.5L9 7H1Z"/>
                </svg>
                {{ activeEvent.upvotes }}
              </button>
              <button
                class="flex items-center gap-1 px-1.5 py-1 rounded transition-colors"
                :class="voted[activeEvent.id] === 'down' ? 'text-ink font-semibold' : 'hover:text-ink'"
                @click="doVote(activeEvent, 'down')"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" :fill="voted[activeEvent.id] === 'down' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round">
                  <path d="M5 8.5L1 3H9Z"/>
                </svg>
                {{ activeEvent.downvotes }}
              </button>
              <button class="ml-auto hover:text-red-500 transition-colors" @click="showReport = showReport === activeEvent.id ? null : activeEvent.id">
                Flag
              </button>
              <button class="hover:text-ink transition-colors" title="Copy link" @click="copyLink">
                {{ copied ? 'Copied' : 'Copy link' }}
              </button>
            </div>

            <div v-if="showReport === activeEvent.id" class="space-y-1.5">
              <input v-model="reportReason" class="field text-[12px]" placeholder="Reason for reporting..." @keydown.enter="doReport(activeEvent.id)" />
              <div class="flex gap-1.5">
                <button class="btn-primary text-[11px] py-1 px-2.5 rounded-md" @click="doReport(activeEvent.id)">Submit</button>
                <button class="btn-ghost text-[11px] py-1 px-2.5 rounded-md" @click="showReport = null">Cancel</button>
              </div>
            </div>

            <div class="border-t border-border pt-3">
              <p class="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2.5">Discussion</p>
              <div v-if="discBusy" class="text-[11px] text-muted">Loading...</div>
              <div v-else-if="!discussions.length" class="text-[11px] text-muted mb-3">No comments yet.</div>
              <div v-else class="space-y-2 mb-3">
                <div v-for="d in discussions" :key="d.id" class="bg-surface rounded-lg px-3 py-2">
                  <p class="text-[12.5px] text-ink leading-relaxed">{{ d.content }}</p>
                  <p class="text-[11px] text-muted mt-0.5">{{ timeAgo(d.created_at) }}</p>
                </div>
              </div>

              <div class="bg-surface rounded-xl border border-border p-2.5">
                <textarea v-model="newComment" rows="2" placeholder="Add to the discussion..."
                  class="w-full text-[12.5px] bg-transparent focus:outline-none placeholder:text-muted resize-none text-ink leading-relaxed" />
                <p v-if="commentErr" class="text-[11px] text-red-500 mb-1">{{ commentErr }}</p>
                <p v-if="commentOk" class="text-[11px] text-emerald-600 mb-1">Submitted for review!</p>
                <div class="flex justify-end">
                  <button class="btn-primary text-[11px] py-1 px-2.5 rounded-md" :disabled="commentBusy || !newComment.trim()" @click="sendComment">
                    {{ commentBusy ? '...' : 'Send' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else key="list" class="flex flex-col flex-1 overflow-hidden">
          <div class="px-3.5 pt-3 pb-2.5 border-b border-border space-y-2 shrink-0">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-semibold text-muted uppercase tracking-widest">Filter</span>
              <div class="flex rounded-md border border-border overflow-hidden text-[11px]">
                <button :class="sort === 'latest' ? 'bg-ink text-canvas' : 'text-dim hover:bg-surface'" class="px-2.5 py-1 transition-colors font-medium" @click="sort = 'latest'">Latest</button>
                <button :class="sort === 'popular' ? 'bg-ink text-canvas' : 'text-dim hover:bg-surface'" class="px-2.5 py-1 transition-colors font-medium border-l border-border" @click="sort = 'popular'">Popular</button>
              </div>
            </div>
            <div class="flex gap-1 flex-wrap">
              <button v-for="t in typeFilters" :key="t.value" :class="filter === t.value ? 'chip-active' : 'chip'" @click="filter = t.value">{{ t.label }}</button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div v-if="loading && !sorted.length" class="flex items-center justify-center h-20 text-[12px] text-muted">Loading...</div>
            <div v-else-if="!sorted.length" class="flex items-center justify-center h-20 text-[12px] text-muted">No events</div>
            <div v-else class="divide-y divide-border">
              <div
                v-for="event in sorted"
                :key="event.id"
                class="group px-4 py-3.5 hover:bg-surface/50 cursor-pointer transition-colors"
                @click="selectEvent(event)"
              >
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <div class="flex items-center gap-2">
                    <EventTypeTag :type="event.event_type" />
                    <AiVerifiedBadge v-if="event.ai_verified" />
                  </div>
                  <span class="text-[11px] text-muted tabular-nums shrink-0">{{ timeAgo(event.created_at) }}</span>
                </div>
                <h3 class="text-[13px] font-semibold text-ink leading-snug mb-1 group-hover:text-ink/75 transition-colors line-clamp-2">{{ event.title }}</h3>
                <p v-if="event.location_name" class="text-[11px] text-muted flex items-center gap-1">
                  <svg width="8" height="8" viewBox="0 0 9 9" fill="currentColor" class="opacity-60 shrink-0">
                    <path d="M4.5 0C2.567 0 1 1.567 1 3.5C1 5.833 4.5 9 4.5 9C4.5 9 8 5.833 8 3.5C8 1.567 6.433 0 4.5 0Z"/>
                  </svg>
                  {{ event.location_name }}
                </p>
              </div>
            </div>
          </div>
        </div>
    </Transition>

  </aside>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: transform 0.15s ease, opacity 0.15s ease; }
.slide-enter-from { transform: translateX(12px); opacity: 0; }
.slide-leave-to  { transform: translateX(-12px); opacity: 0; }

.fade-msg-enter-active, .fade-msg-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-msg-enter-from, .fade-msg-leave-to       { opacity: 0; transform: translateY(-4px); }
</style>
