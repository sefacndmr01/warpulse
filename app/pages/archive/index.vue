<script setup lang="ts">
import { EVENT_TYPES, timeAgo } from '~/composables/useEventTypes'
import type { WarpulseEvent } from '~/composables/useEvents'
import AppSelect from '~/components/AppSelect.vue'
import AppDate from '~/components/AppDate.vue'

definePageMeta({ layout: 'archive' })

const SITE_URL = 'https://warpulse.news'

useSeoMeta({
  title: 'Event Archive',
  description: 'Browse all documented Iran-Israel war events. Search and filter airstrikes, missile launches, Operation Midnight Hammer, Tehran strikes, and political events. Real-time conflict archive.',
  ogTitle: 'Iran-Israel War Event Archive | Warpulse',
  ogDescription: 'Complete archive of conflict events from the Iran-Israel war 2026. Filter by event type, date and location. AI-verified reports.',
  ogUrl: `${SITE_URL}/archive`,
  ogImage: `${SITE_URL}/og.svg`,
  twitterTitle: 'Iran-Israel War Archive | Warpulse',
  twitterDescription: 'Browse and search all Iran-Israel war events: airstrikes, missiles, ground operations, political developments.',
  robots: 'index, follow',
})

useHead({ link: [{ rel: 'canonical', href: `${SITE_URL}/archive` }] })

const router = useRouter()
const { call } = useEdge()

const q = ref('')
const type = ref<'all' | string>('all')
const sort = ref<'latest' | 'popular'>('latest')
const from = ref('')
const to = ref('')

const page = ref(0)
const busy = ref(false)
const done = ref(false)
const items = ref<WarpulseEvent[]>([])
const sentinel = ref<HTMLElement | null>(null)

const typeOptions = [
  { value: 'all', label: 'All types' },
  ...Object.entries(EVENT_TYPES).map(([k, v]) => ({ value: k, label: v.label })),
]

const fetchPage = async (reset = false) => {
  if (busy.value) return
  if (!reset && done.value) return

  busy.value = true
  try {
    if (reset) {
      page.value = 0
      done.value = false
      items.value = []
    }

    const res = await call<{ data: WarpulseEvent[] }>(`/events/archive`, {
      query: {
        q: q.value || undefined,
        type: type.value,
        sort: sort.value,
        from: from.value || undefined,
        to: to.value || undefined,
        page: page.value,
        limit: 30,
      },
    })

    const next = res.data ?? []
    if (!next.length) {
      done.value = true
      return
    }

    const seen = new Set(items.value.map(i => i.id))
    for (const ev of next)
      if (!seen.has(ev.id))
        items.value.push(ev)

    if (next.length < 30) done.value = true
    page.value++
  } finally {
    busy.value = false
  }
}

watch([q, type, sort, from, to], () => fetchPage(true))

onMounted(async () => {
  await fetchPage(true)

  if (!sentinel.value || !import.meta.client) return
  const io = new IntersectionObserver((entries) => {
    if (!entries.some(e => e.isIntersecting)) return
    fetchPage(false)
  }, { rootMargin: '400px' })
  io.observe(sentinel.value)
  onBeforeUnmount(() => io.disconnect())
})

const open = (ev: WarpulseEvent) => router.push(`/archive/${ev.id}`)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-end justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-[14px] font-semibold text-ink">Event archive</h1>
        <p class="text-[12px] text-muted mt-0.5">Browse approved historical events.</p>
      </div>
      <NuxtLink to="/map" class="btn-ghost text-[12px] py-2 px-3 rounded-lg">Back to map</NuxtLink>
    </div>

    <div class="bg-card border border-border rounded-2xl p-3">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
        <div class="md:col-span-5">
          <label class="block text-[10px] font-semibold text-muted uppercase tracking-widest mb-1.5">Title</label>
          <input v-model="q" class="field" placeholder="Search by title..." />
        </div>

        <div class="md:col-span-3">
          <label class="block text-[10px] font-semibold text-muted uppercase tracking-widest mb-1.5">Type</label>
          <AppSelect v-model="type" :options="typeOptions" />
        </div>

        <div class="md:col-span-2">
          <label class="block text-[10px] font-semibold text-muted uppercase tracking-widest mb-1.5">From</label>
          <AppDate v-model="from" />
        </div>

        <div class="md:col-span-2">
          <label class="block text-[10px] font-semibold text-muted uppercase tracking-widest mb-1.5">To</label>
          <AppDate v-model="to" />
        </div>
      </div>

      <div class="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border">
        <div class="text-[11px] text-muted">{{ items.length }} loaded</div>
        <div class="flex rounded-md border border-border overflow-hidden text-[11px] bg-surface">
          <button :class="sort === 'latest' ? 'bg-ink text-canvas' : 'text-dim hover:bg-canvas'" class="px-2.5 py-1 transition-colors font-medium" @click="sort = 'latest'">Latest</button>
          <button :class="sort === 'popular' ? 'bg-ink text-canvas' : 'text-dim hover:bg-canvas'" class="px-2.5 py-1 transition-colors font-medium border-l border-border" @click="sort = 'popular'">Popular</button>
        </div>
      </div>
    </div>

    <div class="bg-card border border-border rounded-2xl overflow-hidden">
      <div v-if="!items.length && busy" class="p-6 text-[12px] text-muted">Loading...</div>
      <div v-else-if="!items.length" class="p-6 text-[12px] text-muted">No events found.</div>
      <div v-else class="divide-y divide-border">
        <button
          v-for="ev in items"
          :key="ev.id"
          class="w-full text-left px-4 py-3.5 hover:bg-surface/50 transition-colors"
          @click="open(ev)"
        >
          <div class="flex items-center gap-2 mb-1.5">
            <EventTypeTag :type="ev.event_type" />
            <AiVerifiedBadge v-if="ev.ai_verified" />
            <span class="ml-auto text-[11px] text-muted tabular-nums">{{ timeAgo(ev.created_at) }}</span>
          </div>
          <div class="text-[13px] font-semibold text-ink leading-snug line-clamp-2">{{ ev.title }}</div>
          <div v-if="ev.location_name" class="text-[11px] text-muted mt-1">📍 {{ ev.location_name }}</div>
        </button>
      </div>

      <div class="px-4 py-3 border-t border-border">
        <div v-if="busy" class="text-[11px] text-muted">Loading more...</div>
        <div v-else-if="done" class="text-[11px] text-muted">End of results.</div>
        <div ref="sentinel" class="h-1" />
      </div>
    </div>
  </div>
</template>

