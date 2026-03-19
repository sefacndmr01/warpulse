import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export interface WarpulseEvent {
  id: string
  title: string
  description: string | null
  source_url: string | null
  event_type: string
  lat: number
  lng: number
  location_name: string | null
  status: string
  ai_verified: boolean
  ai_confidence: number | null
  upvotes: number
  downvotes: number
  created_at: string
  updated_at: string
}

export const useEvents = () => {
  const supabase = useSupabaseClient()
  const { call } = useEdge()

  const events  = useState<WarpulseEvent[]>('events', () => [])
  const loading = useState('events-loading', () => false)
  const filter  = useState<string>('events-filter', () => 'all')
  const sort    = useState<'latest' | 'popular'>('events-sort', () => 'latest')

  const filtered = computed(() =>
    filter.value === 'all' ? events.value : events.value.filter(e => e.event_type === filter.value),
  )

  const sorted = computed(() => {
    const list = [...filtered.value]
    return sort.value === 'popular'
      ? list.sort((a, b) => b.upvotes - a.upvotes)
      : list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  })

  const fetchEvents = async () => {
    loading.value = true
    try {
      events.value = await call<WarpulseEvent[]>('/events', { query: { sort: sort.value, limit: 100 } })
    } finally {
      loading.value = false
    }
  }

  const handleChange = (payload: RealtimePostgresChangesPayload<WarpulseEvent>) => {
    if (payload.eventType === 'INSERT') {
      if (payload.new.status === 'approved')
        events.value.push(payload.new)
    }
    else if (payload.eventType === 'UPDATE') {
      const idx = events.value.findIndex(e => e.id === payload.new.id)
      if (payload.new.status === 'approved') {
        if (idx >= 0) events.value[idx] = payload.new
        else events.value.push(payload.new)
      }
      else {
        if (idx >= 0) events.value.splice(idx, 1)
      }
    }
    else if (payload.eventType === 'DELETE') {
      if (payload.old.id)
        events.value = events.value.filter(e => e.id !== payload.old.id)
    }
  }

  const subscribe = (): RealtimeChannel =>
    supabase
      .channel('events-live')
      .on<WarpulseEvent>('postgres_changes', { event: '*', schema: 'public', table: 'events' }, handleChange)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') fetchEvents()
      })

  const unsubscribe = (channel: RealtimeChannel) => supabase.removeChannel(channel)

  const vote = async (id: string, direction: 'up' | 'down') =>
    call<{ ok: boolean; switched: boolean; direction: string }>(
      `/events/${id}/vote`,
      { method: 'POST', body: { direction } },
    )

  const report = async (id: string, reason: string) => {
    await call(`/events/${id}/report`, { method: 'POST', body: { reason } })
  }

  return { events, filtered, sorted, loading, filter, sort, fetchEvents, vote, report, subscribe, unsubscribe }
}
