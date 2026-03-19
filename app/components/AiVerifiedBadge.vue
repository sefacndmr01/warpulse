<script setup lang="ts">
defineProps<{ confidence?: number | null; inline?: boolean }>()
</script>

<template>
  <span class="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 select-none">
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" class="shrink-0">
      <circle cx="5.5" cy="5.5" r="5" stroke="#059669" stroke-width="1"/>
      <path d="M3 5.5L4.8 7.3L8 4" stroke="#059669" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>AI verified</span>
  </span>
</template>
