<script setup lang="ts">
import { useEventTypes } from '~/composables/useEventTypes'

const props = defineProps<{ type: string; dot?: boolean }>()
const { getConfig, getLabel } = useEventTypes()
const cfg = computed(() => getConfig(props.type))
</script>

<template>
  <span class="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider select-none" :style="{ color: cfg.markerColor }">
    <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ background: cfg.markerColor }" />
    {{ getLabel(type) }}
  </span>
</template>
