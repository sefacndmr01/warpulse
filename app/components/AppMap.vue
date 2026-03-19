<script setup lang="ts">
import type { Map as LMap, Marker, TileLayer } from 'leaflet'
import { useEventTypes, timeAgo } from '~/composables/useEventTypes'
import type { WarpulseEvent } from '~/composables/useEvents'

const props = defineProps<{
  events: WarpulseEvent[]
  pickMode?: boolean
  initialLat?: number
  initialLng?: number
}>()

const emit = defineEmits<{
  locationPicked: [lat: number, lng: number, locationName: string]
  eventSelected: [event: WarpulseEvent]
}>()

const mapEl = ref<HTMLElement | null>(null)
const isDark = ref(false)
let map: LMap | null = null
let tileLayer: TileLayer | null = null
const markers = new Map<string, Marker>()
let pickMarker: Marker | null = null

const { getMarkerSvg, getLabel } = useEventTypes()

const TILES_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILES_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const ATTRIBUTION = '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>'
const MIN_ZOOM = 3
const MAX_ZOOM = 18
const tileOpts = { attribution: ATTRIBUTION, subdomains: 'abcd', minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM, noWrap: true } as const

const WORLD_BOUNDS_SW = [-75, -180] as [number, number]
const WORLD_BOUNDS_NE = [ 80,  180] as [number, number]

const initMap = async () => {
  if (!mapEl.value) return
  const L = (await import('leaflet')).default

  const bounds = L.latLngBounds(WORLD_BOUNDS_SW, WORLD_BOUNDS_NE)
  map = L.map(mapEl.value, {
    center: [20, 10],
    zoom: MIN_ZOOM,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    zoomControl: true,
    attributionControl: true,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
    worldCopyJump: false,
    inertia: false,
    bounceAtZoomLimits: false,
  })
  isDark.value = import.meta.client ? document.documentElement.classList.contains('dark') : false
  tileLayer = L.tileLayer(isDark.value ? TILES_DARK : TILES_LIGHT, tileOpts).addTo(map)
  map.setMaxBounds(bounds)

  map.on('zoomend', () => {
    if (map!.getZoom() < MIN_ZOOM) map!.setZoom(MIN_ZOOM)
  })

  if (props.pickMode)
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      if (pickMarker) pickMarker.remove()
      pickMarker = L.marker([lat, lng]).addTo(map!)
      emit('locationPicked', lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    })

  if (props.initialLat && props.initialLng) {
    map.setView([props.initialLat, props.initialLng], 6)
    pickMarker = L.marker([props.initialLat, props.initialLng]).addTo(map)
  }

  syncMarkers(L)
}

const syncMarkers = async (LeafletIn?: unknown) => {
  if (!map) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const L = (LeafletIn ?? (await import('leaflet'))) as any
  const currentIds = new Set(props.events.map(e => e.id))

  for (const [id, marker] of markers.entries()) {
    if (currentIds.has(id)) continue
    marker.remove()
    markers.delete(id)
  }

  for (const event of props.events) {
    if (markers.has(event.id)) continue
    const icon = L.divIcon({
      html: getMarkerSvg(event.event_type),
      iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -40],
      className: '',
    })
    const marker = L.marker([event.lat, event.lng], { icon })
      .addTo(map)
      .bindPopup(() => buildPopup(event), { maxWidth: 280 })
    marker.on('click', () => emit('eventSelected', event))
    markers.set(event.id, marker)
  }
}

const buildPopup = (event: WarpulseEvent) => {
  const cfg = useEventTypes().getConfig(event.event_type)
  const dark = isDark.value
  const bg   = dark ? '#121210' : '#ffffff'
  const ink  = dark ? '#f0eee8' : '#18170f'
  const sub  = dark ? '#6a665f' : '#9e9589'
  const bdr  = dark ? '#2f2d28' : '#e0dbd3'

  const aiLine = event.ai_verified
    ? `<span style="color:#059669;font-size:10px;font-weight:500;display:inline-flex;align-items:center;gap:3px">
        <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="5" stroke="#059669" stroke-width="1"/><path d="M3 5.5L4.8 7.3L8 4" stroke="#059669" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        AI verified</span>`
    : ''

  const sourceLine = event.source_url
    ? `<a href="${event.source_url}" target="_blank" rel="noopener" style="font-size:11px;color:${sub};text-decoration:none">Source ↗</a>`
    : ''

  const el = document.createElement('div')
  el.style.cssText = `min-width:210px;max-width:270px;padding:14px 16px;background:${bg};border-radius:12px;font-family:Inter,system-ui,sans-serif`
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:${cfg.markerColor}">
        <span style="width:6px;height:6px;border-radius:50%;background:${cfg.markerColor};display:inline-block"></span>
        ${getLabel(event.event_type)}
      </span>
      ${aiLine}
    </div>
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;line-height:1.4;color:${ink}">${event.title}</p>
    ${event.location_name ? `<p style="margin:0 0 6px;font-size:11px;color:${sub}">📍 ${event.location_name}</p>` : ''}
    <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid ${bdr};padding-top:8px;margin-top:4px">
      <span style="font-size:11px;color:${sub}">${timeAgo(event.created_at)}</span>
      ${sourceLine}
    </div>`
  return el
}

const switchTiles = async (dark: boolean) => {
  if (!map) return
  const L = (await import('leaflet')).default
  tileLayer?.remove()
  tileLayer = L.tileLayer(dark ? TILES_DARK : TILES_LIGHT, tileOpts).addTo(map)
}

const setTheme = (dark: boolean) => {
  isDark.value = dark
  switchTiles(dark)
}

const flyTo = (lat: number, lng: number, zoom = 10) => {
  map?.flyTo([lat, lng], zoom, { duration: 1.4 })
}

watch(() => props.events, () => syncMarkers(), { deep: true })

onMounted(() => initMap())
onBeforeUnmount(() => { map?.remove(); map = null })

defineExpose({ flyTo, setTheme })
</script>

<template>
  <div class="relative w-full h-full">
    <div ref="mapEl" class="w-full h-full" />
  </div>
</template>
