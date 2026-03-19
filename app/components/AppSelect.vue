<script setup lang="ts">
type Opt = { value: string; label: string }

const props = defineProps<{
  modelValue: string
  options: Opt[]
  disabled?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isOpen     = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const dropRef    = ref<HTMLElement | null>(null)
const pos        = ref({ top: 0, left: 0, width: 0 })

const selected = computed(() => props.options.find(o => o.value === props.modelValue))

const openDrop = () => {
  if (props.disabled) return
  const r = triggerRef.value!.getBoundingClientRect()
  pos.value = { top: r.bottom + 4, left: r.left, width: r.width }
  isOpen.value = true
}

const closeDrop = () => { isOpen.value = false }
const toggle    = () => isOpen.value ? closeDrop() : openDrop()

const pick = (value: string) => {
  emit('update:modelValue', value)
  closeDrop()
}

const onMousedown = (e: MouseEvent) => {
  if (
    !triggerRef.value?.contains(e.target as Node) &&
    !dropRef.value?.contains(e.target as Node)
  ) closeDrop()
}

const onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrop() }

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
        isOpen    ? 'border-dim'                  : '',
        disabled  ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      @click="toggle"
    >
      <span class="flex-1 truncate text-left" :class="selected ? 'text-ink' : 'text-muted'">
        {{ selected?.label ?? placeholder ?? '—' }}
      </span>
      <svg
        class="shrink-0 text-muted transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        width="12" height="12" viewBox="0 0 12 12" fill="none"
      >
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Dropdown -->
    <Teleport to="body">
      <Transition name="drop">
        <div
          v-if="isOpen"
          ref="dropRef"
          :style="{ position: 'fixed', top: `${pos.top}px`, left: `${pos.left}px`, width: `${pos.width}px` }"
          class="z-[9999] bg-card border border-border rounded-xl shadow-xl overflow-hidden"
          style="max-height: 240px; overflow-y: auto;"
        >
          <div class="py-1">
            <button
              v-for="o in options"
              :key="o.value"
              type="button"
              class="w-full flex items-center gap-2 px-3 py-[7px] text-[13px] text-left transition-colors"
              :class="o.value === modelValue
                ? 'bg-surface text-ink font-medium'
                : 'text-dim hover:bg-surface hover:text-ink'"
              @mousedown.prevent
              @click="pick(o.value)"
            >
              <span class="flex-1 text-left leading-snug">{{ o.label }}</span>
              <svg
                v-if="o.value === modelValue"
                class="shrink-0 text-muted"
                width="11" height="11" viewBox="0 0 11 11" fill="none"
              >
                <path d="M1.5 5.5L4 8L9.5 2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
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
.drop-leave-to      { opacity: 0; transform: translateY(-6px) scaleY(0.96); transform-origin: top; }
</style>
