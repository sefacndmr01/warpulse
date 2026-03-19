export interface EventTypeConfig {
  label: string
  color: string
  bg: string
  text: string
  markerColor: string
}

export const EVENT_TYPES: Record<string, EventTypeConfig> = {
  attack:       { label: 'Attack',       color: '#dc2626', bg: 'bg-red-100',    text: 'text-red-700',    markerColor: '#dc2626' },
  missile:      { label: 'Missile',      color: '#ea580c', bg: 'bg-orange-100', text: 'text-orange-700', markerColor: '#ea580c' },
  airstrike:    { label: 'Airstrike',    color: '#9333ea', bg: 'bg-purple-100', text: 'text-purple-700', markerColor: '#9333ea' },
  explosion:    { label: 'Explosion',    color: '#b45309', bg: 'bg-amber-100',  text: 'text-amber-700',  markerColor: '#b45309' },
  political:    { label: 'Political',    color: '#2563eb', bg: 'bg-blue-100',   text: 'text-blue-700',   markerColor: '#2563eb' },
  protest:      { label: 'Protest',      color: '#0891b2', bg: 'bg-cyan-100',   text: 'text-cyan-700',   markerColor: '#0891b2' },
  ceasefire:    { label: 'Ceasefire',    color: '#16a34a', bg: 'bg-green-100',  text: 'text-green-700',  markerColor: '#16a34a' },
  humanitarian: { label: 'Humanitarian', color: '#0d9488', bg: 'bg-teal-100',   text: 'text-teal-700',   markerColor: '#0d9488' },
  displacement: { label: 'Displacement', color: '#7c3aed', bg: 'bg-violet-100', text: 'text-violet-700', markerColor: '#7c3aed' },
  other:        { label: 'Other',        color: '#6b7280', bg: 'bg-gray-100',   text: 'text-gray-600',   markerColor: '#6b7280' },
}

export const useEventTypes = () => {
  const getConfig = (type: string): EventTypeConfig => EVENT_TYPES[type] ?? EVENT_TYPES.other!

  const getLabel = (type: string) => getConfig(type).label

  const getMarkerSvg = (type: string) => {
    const cfg = getConfig(type)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${cfg.markerColor}" opacity="0.9"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
    </svg>`
  }

  return { getConfig, getLabel, getMarkerSvg, EVENT_TYPES }
}

export const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
