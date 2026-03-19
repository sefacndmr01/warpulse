<script setup lang="ts">
const props = defineProps<{
  modelValue: string   // 'YYYY-MM-DD' or ''
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isOpen     = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const calRef     = ref<HTMLElement | null>(null)
const pos        = ref({ top: 0, left: 0 })

const CAL_W   = 264
const today   = new Date()
const viewYear  = ref(today.getFullYear())
const viewMonth = ref(today.getMonth()) // 0–11

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/* ── Derived state ── */

const parsed = computed(() => {
  if (!props.modelValue) return null
  const [y, m, d] = props.modelValue.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
})

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  // T12:00:00 avoids midnight UTC shifting the date by a timezone offset
  return new Date(props.modelValue + 'T12:00:00')
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

const monthLabel = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1)
    .toLocaleString('en-US', { month: 'long', year: 'numeric' }),
)

const cells = computed(() => {
  const startDow  = new Date(viewYear.value, viewMonth.value, 1).getDay()
  const daysTotal = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const p = parsed.value
  const out: { n: number; isToday: boolean; isSel: boolean }[] = []

  for (let i = 0; i < startDow; i++)
    out.push({ n: 0, isToday: false, isSel: false })

  for (let d = 1; d <= daysTotal; d++) {
    const isToday =
      viewYear.value  === today.getFullYear() &&
      viewMonth.value === today.getMonth()    &&
      d               === today.getDate()
    const isSel = !!p && p.year === viewYear.value && p.month === viewMonth.value && p.day === d
    out.push({ n: d, isToday, isSel })
  }
  return out
})

/* ── Actions ── */

const prevMonth = () => {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}

const nextMonth = () => {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}

const pick = (n: number) => {
  if (!n) return
  emit('update:modelValue', `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`)
  isOpen.value = false
}

const clear = (e: MouseEvent) => {
  e.stopPropagation()
  emit('update:modelValue', '')
}

/* ── Open / close ── */

const openCal = () => {
  if (props.disabled) return
  if (parsed.value) {
    viewYear.value  = parsed.value.year
    viewMonth.value = parsed.value.month
  } else {
    viewYear.value  = today.getFullYear()
    viewMonth.value = today.getMonth()
  }
  const r    = triggerRef.value!.getBoundingClientRect()
  const left = r.left + CAL_W > window.innerWidth - 8 ? r.right - CAL_W : r.left
  pos.value  = { top: r.bottom + 4, left }
  isOpen.value = true
}

const closeCal = () => { isOpen.value = false }
const toggle   = () => isOpen.value ? closeCal() : openCal()

/* ── Outside-click / keyboard ── */

const onMousedown = (e: MouseEvent) => {
  if (
    !triggerRef.value?.contains(e.target as Node) &&
    !calRef.value?.contains(e.target as Node)
  ) closeCal()
}

const onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCal() }

onMounted(() => {
  document.addEventListener('mousedown', onMousedown)
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onMousedown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="triggerRef">
    <!-- Trigger -->
    <button
      type="button"
      :disabled="disabled"
      class="field flex items-center gap-2 text-left cursor-pointer select-none transition-colors"
      :class="[
        isOpen   ? 'border-dim'                   : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      @click="toggle"
    >
      <!-- calendar icon -->
      <svg class="shrink-0 text-muted" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3.2 1.8V3M8.8 1.8V3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M2.4 4.2H9.6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M3 2.6H9C9.663 2.6 10.2 3.137 10.2 3.8V9C10.2 9.663 9.663 10.2 9 10.2H3C2.337 10.2 1.8 9.663 1.8 9V3.8C1.8 3.137 2.337 2.6 3 2.6Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
      </svg>

      <span class="flex-1 truncate" :class="modelValue ? 'text-ink' : 'text-muted'">
        {{ displayValue || 'Pick a date' }}
      </span>

      <!-- clear ×  or  chevron ↓ -->
      <button
        v-if="modelValue"
        type="button"
        class="shrink-0 text-muted hover:text-ink transition-colors -mr-0.5"
        @click="clear"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      </button>
      <svg
        v-else
        class="shrink-0 text-muted transition-transform duration-150"
        :class="{ 'rotate-180': isOpen }"
        width="12" height="12" viewBox="0 0 12 12" fill="none"
      >
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Calendar panel (teleported to body to escape any overflow:hidden ancestors) -->
    <Teleport to="body">
      <Transition name="drop">
        <div
          v-if="isOpen"
          ref="calRef"
          :style="{ position: 'fixed', top: `${pos.top}px`, left: `${pos.left}px`, width: `${CAL_W}px` }"
          class="z-[9999] bg-card border border-border rounded-xl shadow-xl p-3"
        >
          <!-- Month header -->
          <div class="flex items-center justify-between mb-3">
            <button
              type="button"
              class="p-1.5 rounded-md hover:bg-surface text-dim hover:text-ink transition-colors"
              @click.stop="prevMonth"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M7 2L4 5.5L7 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <span class="text-[12px] font-semibold text-ink">{{ monthLabel }}</span>
            <button
              type="button"
              class="p-1.5 rounded-md hover:bg-surface text-dim hover:text-ink transition-colors"
              @click.stop="nextMonth"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M4 2L7 5.5L4 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- Day-of-week labels -->
          <div class="grid grid-cols-7 mb-1">
            <span
              v-for="(d, i) in DAY_NAMES"
              :key="i"
              class="flex items-center justify-center text-[10px] font-semibold text-muted h-7"
            >{{ d }}</span>
          </div>

          <!-- Day cells -->
          <div class="grid grid-cols-7 gap-px">
            <button
              v-for="(cell, i) in cells"
              :key="i"
              type="button"
              :disabled="!cell.n"
              class="flex items-center justify-center h-8 rounded-md text-[12px] transition-colors"
              :class="[
                !cell.n ? 'invisible pointer-events-none' : '',
                cell.isSel  ? 'bg-ink text-canvas font-semibold'              : '',
                !cell.isSel && cell.isToday ? 'ring-1 ring-inset ring-dim text-dim font-medium' : '',
                !cell.isSel && !cell.isToday && cell.n ? 'text-ink hover:bg-surface' : '',
              ]"
              @click.stop="pick(cell.n)"
            >
              {{ cell.n || '' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.drop-enter-active,
.drop-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.drop-enter-from,
.drop-leave-to      { opacity: 0; transform: translateY(-4px) scaleY(0.97); transform-origin: top; }
</style>
