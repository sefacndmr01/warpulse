<script setup lang="ts">
import type { RealtimeChannel } from '@supabase/supabase-js'
import { timeAgo } from '~/composables/useEventTypes'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Admin', robots: 'noindex, nofollow' })

const router    = useRouter()
const supabase  = useSupabaseClient()
const { adminCall } = useEdge()

const tab     = ref<'events' | 'discussions' | 'reports'>('events')
const loading = ref(true)
const err     = ref<string | null>(null)
const isLive  = ref(false)

type RowEvent = {
  id: string; title: string; description: string | null
  source_url: string | null; event_type: string
  location_name: string | null; created_at: string
}
type RowDiscussion = {
  id: string; event_id: string; content: string
  created_at: string; events?: { title?: string } | null
}
type RowReport = {
  id: string; event_id: string; reason: string
  created_at: string; events?: { title?: string } | null
}

const events      = ref<RowEvent[]>([])
const discussions = ref<RowDiscussion[]>([])
const reports     = ref<RowReport[]>([])

const ensureAuth = () => {
  if (!import.meta.client) return
  if (!localStorage.getItem('wp_edge_admin'))
    router.replace('/admin/login')
}

const load = async (silent = false) => {
  err.value = null
  if (!silent) loading.value = true
  try {
    const res = await adminCall<{ events: RowEvent[]; discussions: RowDiscussion[]; reports: RowReport[] }>('/admin/queue')
    events.value      = res.events
    discussions.value = res.discussions
    reports.value     = res.reports
  } catch (e: unknown) {
    const msg = (e as { data?: { message?: string } })?.data?.message ?? 'Failed'
    if (msg === 'Unauthorized') { router.replace('/admin/login'); return }
    err.value = msg
  } finally {
    loading.value = false
  }
}

let channels: RealtimeChannel[] = []

onMounted(() => {
  ensureAuth()
  load()

  const refresh = () => load(true)

  channels = [
    supabase.channel('admin-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, refresh)
      .subscribe((status) => { if (status === 'SUBSCRIBED') isLive.value = true }),

    supabase.channel('admin-discussions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'discussions' }, refresh)
      .subscribe(),

    supabase.channel('admin-reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, refresh)
      .subscribe(),
  ]
})

onUnmounted(() => {
  channels.forEach(ch => supabase.removeChannel(ch))
  isLive.value = false
})

const act = async (path: string) => { await adminCall(path, { method: 'POST' }); await load() }

const logout = () => {
  localStorage.removeItem('wp_edge_admin')
  router.replace('/admin/login')
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-end justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-[14px] font-semibold text-ink">Moderation</h1>
        <p class="text-[12px] text-muted mt-0.5">Approve or reject pending submissions and handle reports.</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Live indicator -->
        <div class="flex items-center gap-1.5 text-[11px] text-muted select-none">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span class="hidden sm:inline">Live</span>
        </div>
        <button class="btn-ghost text-[12px] py-2 px-3 rounded-lg" :disabled="loading" @click="load()">Refresh</button>
        <button class="btn-ghost text-[12px] py-2 px-3 rounded-lg" @click="logout">Sign out</button>
      </div>
    </div>

    <div class="bg-card border border-border rounded-2xl p-2 flex gap-1 text-[12px]">
      <button class="flex-1 py-2 rounded-xl transition-colors" :class="tab === 'events' ? 'bg-surface text-ink' : 'text-dim hover:bg-surface/50'" @click="tab = 'events'">
        Events <span class="text-muted ml-1">({{ events.length }})</span>
      </button>
      <button class="flex-1 py-2 rounded-xl transition-colors" :class="tab === 'discussions' ? 'bg-surface text-ink' : 'text-dim hover:bg-surface/50'" @click="tab = 'discussions'">
        Discussions <span class="text-muted ml-1">({{ discussions.length }})</span>
      </button>
      <button class="flex-1 py-2 rounded-xl transition-colors" :class="tab === 'reports' ? 'bg-surface text-ink' : 'text-dim hover:bg-surface/50'" @click="tab = 'reports'">
        Reports <span class="text-muted ml-1">({{ reports.length }})</span>
      </button>
    </div>

    <div v-if="err" class="bg-card border border-border rounded-2xl p-4 text-[12px] text-red-500">{{ err }}</div>

    <div v-if="loading" class="bg-card border border-border rounded-2xl p-6 text-[12px] text-muted">Loading...</div>

    <div v-else-if="tab === 'events'" class="bg-card border border-border rounded-2xl overflow-hidden">
      <div v-if="!events.length" class="p-6 text-[12px] text-muted">No pending events.</div>
      <div v-else class="divide-y divide-border">
        <div v-for="ev in events" :key="ev.id" class="p-4">
          <div class="flex items-center gap-2">
            <EventTypeTag :type="ev.event_type" />
            <span class="text-[13px] font-semibold text-ink">{{ ev.title }}</span>
            <span class="ml-auto text-[11px] text-muted tabular-nums">{{ timeAgo(ev.created_at) }}</span>
          </div>
          <p v-if="ev.location_name" class="text-[11px] text-muted mt-1">📍 {{ ev.location_name }}</p>
          <p v-if="ev.description" class="text-[12px] text-dim mt-2 leading-relaxed line-clamp-3">{{ ev.description }}</p>
          <a v-if="ev.source_url" :href="ev.source_url" target="_blank" rel="noopener" class="inline-flex mt-2 text-[11px] text-dim hover:text-ink transition-colors">Source ↗</a>
          <div class="flex items-center gap-2 mt-3">
            <button class="btn-primary text-[12px] py-2 px-3 rounded-lg" @click="act(`/admin/events/${ev.id}/approve`)">Approve</button>
            <button class="btn-ghost text-[12px] py-2 px-3 rounded-lg hover:text-red-500" @click="act(`/admin/events/${ev.id}/reject`)">Reject</button>
            <NuxtLink :to="`/event/${ev.id}`" class="ml-auto text-[12px] text-dim hover:text-ink transition-colors">Open ↗</NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="tab === 'discussions'" class="bg-card border border-border rounded-2xl overflow-hidden">
      <div v-if="!discussions.length" class="p-6 text-[12px] text-muted">No pending discussions.</div>
      <div v-else class="divide-y divide-border">
        <div v-for="d in discussions" :key="d.id" class="p-4">
          <div class="flex items-center gap-2">
            <span class="text-[12px] font-semibold text-ink">{{ d.events?.title ?? 'Event' }}</span>
            <span class="ml-auto text-[11px] text-muted tabular-nums">{{ timeAgo(d.created_at) }}</span>
          </div>
          <p class="text-[12.5px] text-ink mt-2 leading-relaxed">{{ d.content }}</p>
          <div class="flex items-center gap-2 mt-3">
            <button class="btn-primary text-[12px] py-2 px-3 rounded-lg" @click="act(`/admin/discussions/${d.id}/approve`)">Approve</button>
            <button class="btn-ghost text-[12px] py-2 px-3 rounded-lg hover:text-red-500" @click="act(`/admin/discussions/${d.id}/reject`)">Reject</button>
            <NuxtLink :to="`/event/${d.event_id}`" class="ml-auto text-[12px] text-dim hover:text-ink transition-colors">Open ↗</NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-card border border-border rounded-2xl overflow-hidden">
      <div v-if="!reports.length" class="p-6 text-[12px] text-muted">No pending reports.</div>
      <div v-else class="divide-y divide-border">
        <div v-for="r in reports" :key="r.id" class="p-4">
          <div class="flex items-center gap-2">
            <span class="text-[12px] font-semibold text-ink">{{ r.events?.title ?? 'Event' }}</span>
            <span class="ml-auto text-[11px] text-muted tabular-nums">{{ timeAgo(r.created_at) }}</span>
          </div>
          <p class="text-[12.5px] text-ink mt-2 leading-relaxed">{{ r.reason }}</p>
          <div class="flex items-center gap-2 mt-3">
            <button class="btn-primary text-[12px] py-2 px-3 rounded-lg" @click="act(`/admin/reports/${r.id}/resolve`)">Resolve</button>
            <button class="btn-ghost text-[12px] py-2 px-3 rounded-lg hover:text-red-500" @click="act(`/admin/reports/${r.id}/dismiss`)">Dismiss</button>
            <NuxtLink :to="`/event/${r.event_id}`" class="ml-auto text-[12px] text-dim hover:text-ink transition-colors">Open ↗</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
