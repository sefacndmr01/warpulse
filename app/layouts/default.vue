<script setup lang="ts">
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { WarpulseEvent } from '~/composables/useEvents'

const { events, subscribe, unsubscribe } = useEvents()
const { theme } = useTheme()
const route = useRoute()
const router = useRouter()
const mapRef = ref<{ flyTo: (lat: number, lng: number, zoom?: number) => void; setTheme: (dark: boolean) => void } | null>(null)

const flyTo = (event: WarpulseEvent) => mapRef.value?.flyTo(event.lat, event.lng, 10)
const openEvent = async (event: WarpulseEvent) => {
  if (route.path !== `/event/${event.id}`)
    await router.push(`/event/${event.id}`)
  flyTo(event)
}

watchEffect(() => mapRef.value?.setTheme(theme.value === 'dark'))

let channel: RealtimeChannel | null = null

onMounted(() => { channel = subscribe() })
onUnmounted(() => { if (channel) unsubscribe(channel) })
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-canvas">
    <AppPanel @select="openEvent" />
    <div class="flex-1 relative overflow-hidden">
      <TopBar />
      <ClientOnly>
        <AppMap ref="mapRef" :events="events" @event-selected="openEvent" />
        <template #fallback>
          <div class="w-full h-full flex items-center justify-center bg-canvas text-muted text-sm">
            Loading map...
          </div>
        </template>
      </ClientOnly>
    </div>
    <SubmitModal />
  </div>
</template>
