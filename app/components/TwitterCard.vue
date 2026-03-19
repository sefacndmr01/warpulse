<script setup lang="ts">
import { parseTwitterUrl } from '~/composables/useTwitter'

const props = defineProps<{ url: string }>()

const meta = computed(() => parseTwitterUrl(props.url))
</script>

<template>
  <a
    v-if="meta"
    :href="meta.url"
    target="_blank"
    rel="noopener noreferrer"
    class="block mt-3 rounded-xl border border-border bg-canvas hover:bg-surface transition-colors overflow-hidden no-underline"
    @click.stop
  >
    <div class="px-3.5 py-3 flex items-start gap-3">
      <div class="shrink-0 w-8 h-8 rounded-full bg-ink flex items-center justify-center mt-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.737-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5 mb-1">
          <span class="text-sm font-semibold text-ink">@{{ meta.username }}</span>
          <span class="text-[11px] text-muted">· View on X</span>
        </div>
        <p class="text-[11px] text-dim leading-relaxed line-clamp-1">{{ meta.displayUrl }}</p>
      </div>

      <svg class="shrink-0 text-muted mt-1" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 2.5H9.5M9.5 2.5V9.5M9.5 2.5L2.5 9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </a>
</template>
