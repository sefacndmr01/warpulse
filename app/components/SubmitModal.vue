<script setup lang="ts">
import type { RealtimeChannel } from '@supabase/supabase-js'
import { EVENT_TYPES } from '~/composables/useEventTypes'

const { open, step, loading, error, success, verifying, aiApproved, form, closeModal, submit, setVerified } = useSubmit()
const supabase = useSupabaseClient()
const mapEl    = ref<HTMLElement | null>(null)
let miniMap: import('leaflet').Map | null = null
let miniMapMarker: import('leaflet').Marker | null = null
let verifyChannel: RealtimeChannel | null = null
let verifyTimer: ReturnType<typeof setTimeout> | null = null
const progress = ref(0)

const eventTypeOptions = Object.entries(EVENT_TYPES).map(([k, v]) => ({ value: k, label: v.label }))
const { theme } = useTheme()

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: Record<string, string>
}

const searchQuery   = ref('')
const suggestions   = ref<NominatimResult[]>([])
const searching     = ref(false)
const showSuggestions = ref(false)
const geocoding     = ref(false)
let   searchTimer: ReturnType<typeof setTimeout> | null = null

const NOMINATIM = 'https://nominatim.openstreetmap.org'
const HEADERS   = { 'Accept-Language': 'en', 'User-Agent': 'Warpulse/1.0' }

const formatName = (r: NominatimResult): string => {
  const a = r.address ?? {}
  const city    = a.city ?? a.town ?? a.village ?? a.county ?? a.state_district ?? ''
  const country = a.country ?? ''
  if (city && country) return `${city}, ${country}`
  if (country) return country
  return r.display_name.split(',').slice(0, 2).join(',').trim()
}

const searchLocation = () => {
  if (searchTimer) clearTimeout(searchTimer)
  const q = searchQuery.value.trim()
  if (q.length < 3) { suggestions.value = []; showSuggestions.value = false; return }
  searching.value = true
  searchTimer = setTimeout(async () => {
    try {
      const res = await $fetch<NominatimResult[]>(
        `${NOMINATIM}/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
        { headers: HEADERS },
      )
      suggestions.value = res
      showSuggestions.value = res.length > 0
    } catch {
      suggestions.value = []
    } finally {
      searching.value = false
    }
  }, 400)
}

const reverseGeocode = async (lat: number, lng: number) => {
  geocoding.value = true
  try {
    const res = await $fetch<NominatimResult>(
      `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: HEADERS },
    )
    if (res?.display_name) {
      const name = formatName(res)
      form.value.location_name = name
      searchQuery.value = name
    }
  } catch {} finally {
    geocoding.value = false
  }
}

const placeMarker = async (lat: number, lng: number) => {
  if (!miniMap) return
  const L = (await import('leaflet')).default
  if (miniMapMarker) miniMapMarker.remove()
  miniMapMarker = L.marker([lat, lng]).addTo(miniMap)
  miniMap.setView([lat, lng], Math.max(miniMap.getZoom(), 6))
  form.value.lat = lat
  form.value.lng = lng
}

const setMapLocation = async (lat: number, lng: number, name?: string) => {
  await placeMarker(lat, lng)
  if (name) {
    form.value.location_name = name
    searchQuery.value = name
  } else {
    await reverseGeocode(lat, lng)
  }
}

const selectSuggestion = async (s: NominatimResult) => {
  showSuggestions.value = false
  suggestions.value = []
  const name = formatName(s)
  await setMapLocation(parseFloat(s.lat), parseFloat(s.lon), name)
}

const closeDropdown = () => setTimeout(() => { showSuggestions.value = false }, 150)

const initMiniMap = async () => {
  if (!mapEl.value || miniMap) return
  const L = (await import('leaflet')).default
  miniMap = L.map(mapEl.value, { center: [20, 45], zoom: 3, zoomControl: true })
  const tiles = theme.value === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
  L.tileLayer(tiles, { attribution: '&copy; CARTO &copy; OSM', subdomains: 'abcd', maxZoom: 18 }).addTo(miniMap)
  miniMap.on('click', (e) => setMapLocation(e.latlng.lat, e.latlng.lng))
}

const goToStep2 = () => {
  if (!form.value.title.trim()) return
  step.value = 2
  nextTick(() => setTimeout(() => { initMiniMap(); miniMap?.invalidateSize() }, 100))
}

const VERIFY_TIMEOUT_MS = 14_000

const stopVerify = () => {
  if (verifyTimer)   { clearTimeout(verifyTimer); verifyTimer = null }
  if (verifyChannel) { supabase.removeChannel(verifyChannel); verifyChannel = null }
  progress.value = 0
}

const startVerify = (eventId: string) => {
  progress.value = 0
  // Animate progress bar over the timeout window
  nextTick(() => { progress.value = 100 })

  verifyChannel = supabase
    .channel(`verify-${eventId}`)
    .on<{ id: string; status: string }>(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'events', filter: `id=eq.${eventId}` },
      (payload) => {
        const status = payload.new?.status
        if (status === 'approved' || status === 'rejected') {
          stopVerify()
          setVerified(status === 'approved')
        }
      },
    )
    .subscribe()

  verifyTimer = setTimeout(() => {
    stopVerify()
    setVerified(false) // timed out → manual review
  }, VERIFY_TIMEOUT_MS)
}

const handleSubmit = async () => {
  const eventId = await submit()
  if (eventId) startVerify(eventId)
}

watch(open, (val) => {
  if (!val) {
    stopVerify()
    if (miniMapMarker) { miniMapMarker.remove(); miniMapMarker = null }
    if (miniMap) { miniMap.remove(); miniMap = null }
    searchQuery.value = ''
    suggestions.value = []
    showSuggestions.value = false
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[9999] flex items-center justify-center">
        <div class="absolute inset-0 bg-ink/50" @click="closeModal" />

        <div class="relative bg-card rounded-2xl shadow-xl w-full max-w-[480px] mx-4 overflow-hidden border border-border">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-border">
            <div class="flex items-center gap-3">
              <h2 class="text-[14px] font-semibold text-ink">Report an Event</h2>
              <span v-if="!verifying && !success" class="text-[11px] text-muted bg-canvas px-2 py-0.5 rounded-md border border-border">
                {{ step }}/2
              </span>
              <span v-else-if="verifying" class="text-[11px] text-muted bg-canvas px-2 py-0.5 rounded-md border border-border">
                AI check
              </span>
            </div>
            <button class="text-muted hover:text-ink transition-colors p-1" @click="closeModal">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- ── AI Verifying ── -->
          <div v-if="verifying" class="px-5 py-10 flex flex-col items-center gap-5 text-center">
            <div class="relative w-11 h-11">
              <!-- Track ring -->
              <svg class="w-11 h-11 text-border -rotate-90" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="19" stroke="currentColor" stroke-width="2.5"/>
              </svg>
              <!-- Spinning arc -->
              <svg class="w-11 h-11 text-ink absolute inset-0 -rotate-90 animate-spin" viewBox="0 0 44 44" fill="none" style="animation-duration: 0.9s">
                <circle cx="22" cy="22" r="19" stroke="currentColor" stroke-width="2.5"
                  stroke-dasharray="30 90" stroke-linecap="round"/>
              </svg>
            </div>

            <div>
              <p class="text-[14px] font-semibold text-ink">AI Verification</p>
              <p class="text-[12px] text-muted mt-1">Checking credibility and sources…</p>
            </div>

            <!-- Progress bar -->
            <div class="w-full max-w-[200px] h-0.5 bg-surface rounded-full overflow-hidden">
              <div
                class="h-full bg-ink rounded-full"
                :style="{ width: `${progress}%`, transition: `width ${VERIFY_TIMEOUT_MS}ms linear` }"
              />
            </div>
          </div>

          <!-- ── Success: AI approved ── -->
          <div v-else-if="success && aiApproved" class="px-5 py-12 flex flex-col items-center gap-3 text-center">
            <div class="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3.5 9L7 12.5L14.5 5" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-1.5 justify-center mb-1.5">
                <AiVerifiedBadge />
              </div>
              <p class="text-[14px] font-semibold text-ink">Verified &amp; published</p>
              <p class="text-[12px] text-muted mt-1 max-w-xs">Your event is now live on the map.</p>
            </div>
          </div>

          <!-- ── Success: manual review ── -->
          <div v-else-if="success && !aiApproved" class="px-5 py-12 flex flex-col items-center gap-3 text-center">
            <div class="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="#d97706" stroke-width="1.6"/>
                <path d="M9 5.5V9.5" stroke="#d97706" stroke-width="1.6" stroke-linecap="round"/>
                <circle cx="9" cy="12" r="0.8" fill="#d97706"/>
              </svg>
            </div>
            <div>
              <p class="text-[14px] font-semibold text-ink">Submitted for review</p>
              <p class="text-[12px] text-muted mt-1 max-w-xs">AI could not verify automatically. A moderator will review your submission shortly.</p>
            </div>
          </div>

          <!-- ── Step 1: Details ── -->
          <div v-else-if="step === 1" class="px-5 py-5 flex flex-col gap-3.5">
            <div>
              <label class="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Title <span class="text-red-400 normal-case font-normal tracking-normal">required</span></label>
              <input
                v-model="form.title"
                type="text"
                placeholder="e.g. Missile strike on power grid"
                class="w-full px-3 py-2 text-[13px] border border-border rounded-lg bg-canvas focus:outline-none focus:border-dim placeholder:text-muted"
              />
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Event Type <span class="text-red-400 normal-case font-normal tracking-normal">required</span></label>
              <AppSelect v-model="form.event_type" :options="eventTypeOptions" />
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Source URL</label>
              <input
                v-model="form.source_url"
                type="url"
                placeholder="https://twitter.com/… or news URL"
                class="w-full px-3 py-2 text-[13px] border border-border rounded-lg bg-canvas focus:outline-none focus:border-dim placeholder:text-muted"
              />
              <p class="text-[11px] text-muted mt-1">Twitter/X links and news URLs improve AI verification</p>
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Describe what happened..."
                class="w-full px-3 py-2 text-[13px] border border-border rounded-lg bg-canvas focus:outline-none focus:border-dim placeholder:text-muted resize-none"
              />
            </div>

            <button class="btn-primary w-full justify-center py-2.5 mt-1 rounded-lg text-[13px]" @click="goToStep2">
              Next: Pick Location
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2.5 6.5H10.5M10.5 6.5L7 3M10.5 6.5L7 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- ── Step 2: Location ── -->
          <div v-else-if="step === 2" class="px-5 py-5 flex flex-col gap-3.5">

            <!-- Search box -->
            <div>
              <label class="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                Search location <span class="text-red-400 normal-case font-normal tracking-normal">required</span>
              </label>
              <div class="relative">
                <div class="relative flex items-center">
                  <svg class="absolute left-3 text-muted shrink-0" width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" stroke-width="1.3"/>
                    <path d="M9 9l2.5 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                  </svg>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Type a city or coordinates or location name…"
                    class="w-full pl-8 pr-8 py-2 text-[13px] border border-border rounded-lg bg-canvas focus:outline-none focus:border-dim placeholder:text-muted"
                    autocomplete="off"
                    @input="searchLocation"
                    @keydown.esc="showSuggestions = false"
                    @blur="closeDropdown"
                  />
                  <span v-if="searching" class="absolute right-2.5">
                    <svg class="animate-spin text-muted" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5" stroke-dasharray="8 6"/>
                    </svg>
                  </span>
                  <button
                    v-else-if="searchQuery"
                    class="absolute right-2 text-muted hover:text-ink transition-colors"
                    @mousedown.prevent="searchQuery = ''; suggestions = []; showSuggestions = false; form.location_name = ''"
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>

                <!-- Dropdown suggestions -->
                <Transition name="dropdown">
                  <div
                    v-if="showSuggestions && suggestions.length"
                    class="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden"
                  >
                    <button
                      v-for="s in suggestions"
                      :key="s.place_id"
                      class="w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-surface transition-colors border-b border-border last:border-0"
                      @mousedown.prevent="selectSuggestion(s)"
                    >
                      <svg class="shrink-0 mt-0.5 text-muted" width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
                        <path d="M5.5 0C3.567 0 2 1.567 2 3.5C2 5.833 5.5 11 5.5 11C5.5 11 9 5.833 9 3.5C9 1.567 7.433 0 5.5 0Z"/>
                      </svg>
                      <div class="min-w-0">
                        <p class="text-[12.5px] font-medium text-ink leading-snug truncate">{{ formatName(s) }}</p>
                        <p class="text-[11px] text-muted truncate mt-0.5">{{ s.display_name }}</p>
                      </div>
                    </button>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Map -->
            <div>
              <label class="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                Or click on the map
              </label>
              <div ref="mapEl" class="w-full h-44 rounded-lg border border-border overflow-hidden" />
            </div>

            <!-- Location name (auto-filled, editable) -->
            <div>
              <label class="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                Location name
                <span v-if="geocoding" class="ml-1 font-normal normal-case tracking-normal text-muted">resolving…</span>
              </label>
              <input
                v-model="form.location_name"
                type="text"
                placeholder="Will be auto-filled from map selection or you can customize it"
                class="w-full px-3 py-2 text-[13px] border border-border rounded-lg bg-canvas focus:outline-none focus:border-dim placeholder:text-muted"
              />
              <p v-if="form.lat" class="text-[11px] text-muted font-mono mt-1">
                {{ form.lat.toFixed(5) }}, {{ form.lng?.toFixed(5) }}
              </p>
            </div>

            <div v-if="error" class="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {{ error }}
            </div>

            <div class="flex gap-2 mt-1">
              <button class="btn-ghost flex-1 justify-center py-2.5 rounded-lg text-[13px]" @click="step = 1">← Back</button>
              <button
                class="btn-primary flex-1 justify-center py-2.5 rounded-lg text-[13px]"
                :disabled="loading || !form.lat"
                @click="handleSubmit"
              >
                {{ loading ? 'Submitting…' : 'Submit Report' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
