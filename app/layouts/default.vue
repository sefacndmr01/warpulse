<script setup lang="ts">
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { WarpulseEvent } from '~/composables/useEvents'

const { events, subscribe, unsubscribe } = useEvents()
const { theme } = useTheme()
const { open: panelOpen } = usePanel()
const route = useRoute()
const router = useRouter()
const mapRef = ref<{ flyTo: (lat: number, lng: number, zoom?: number) => void; setTheme: (dark: boolean) => void } | null>(null)

const flyTo = (event: WarpulseEvent) => mapRef.value?.flyTo(event.lat, event.lng, 10)
const openEvent = async (event: WarpulseEvent) => {
  if (route.path !== `/event/${event.id}`)
    await router.push(`/event/${event.id}`)
  flyTo(event)
  panelOpen.value = true
}

watchEffect(() => mapRef.value?.setTheme(theme.value === 'dark'))

let channel: RealtimeChannel | null = null
onMounted(() => { channel = subscribe() })
onUnmounted(() => { if (channel) unsubscribe(channel) })
</script>

<template>
  <div class="flex h-[100dvh] overflow-hidden bg-canvas">
    <AppPanel @select="openEvent" />

    <div class="flex-1 relative overflow-hidden min-w-0">
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

    <Transition name="bd">
      <div
        v-if="panelOpen"
        class="md:hidden fixed inset-0 z-[5900] bg-black/50"
        @click="panelOpen = false"
      />
    </Transition>

    <SubmitModal />
  </div>
</template>

<style scoped>
.bd-enter-active, .bd-leave-active { transition: opacity 0.25s ease; }
.bd-enter-from, .bd-leave-to { opacity: 0; }
</style>
