<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const close = () => emit('close')
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[10000] flex items-center justify-center">
        <div class="absolute inset-0 bg-ink/50" @click="close" />
        <div class="relative w-full max-w-[520px] mx-4 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 class="text-[14px] font-semibold text-ink">Disclaimer</h2>
            <button class="text-muted hover:text-ink transition-colors p-1" aria-label="Close" @click="close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="px-5 py-4 space-y-3">
            <p class="text-[12.5px] text-dim leading-relaxed">
              Warpulse is an open-source, community-driven project.
            </p>
            <p class="text-[12.5px] text-dim leading-relaxed">
              Reports and comments are submitted by anonymous users. Content may be inaccurate, incomplete, or intentionally misleading.
            </p>
            <p class="text-[12.5px] text-dim leading-relaxed">
              Any “AI verified” label is probabilistic and not a guarantee of truth. Always cross-check with independent sources and official channels.
            </p>
            <p class="text-[12px] text-muted leading-relaxed">
              By using this site, you acknowledge and accept this disclaimer.
            </p>
          </div>

          <div class="px-5 py-4 border-t border-border flex items-center justify-between gap-3">
            <a
              class="btn-ghost text-[12px] py-2 px-3 rounded-lg inline-flex items-center gap-2"
              href="https://github.com/sefacndmr01/warpulse"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="text-ink">
                <path d="M12 .5C5.73.5.75 5.73.75 12.22c0 5.2 3.44 9.6 8.2 11.16.6.12.82-.27.82-.58v-2.15c-3.34.74-4.04-1.67-4.04-1.67-.54-1.42-1.32-1.8-1.32-1.8-1.08-.76.08-.75.08-.75 1.2.09 1.83 1.27 1.83 1.27 1.06 1.9 2.78 1.35 3.46 1.03.11-.8.42-1.35.76-1.66-2.67-.31-5.47-1.39-5.47-6.19 0-1.37.46-2.49 1.22-3.37-.12-.31-.53-1.58.12-3.29 0 0 1-.33 3.3 1.29a11.1 11.1 0 0 1 6 0c2.3-1.62 3.3-1.29 3.3-1.29.65 1.71.24 2.98.12 3.29.76.88 1.22 2 1.22 3.37 0 4.81-2.8 5.87-5.48 6.18.43.39.82 1.15.82 2.31v3.43c0 .32.22.71.82.58 4.76-1.56 8.2-5.96 8.2-11.16C23.25 5.73 18.27.5 12 .5Z"/>
              </svg>
              GitHub
            </a>
            <button class="btn-primary text-[12px] py-2 px-3 rounded-lg" @click="close">I understand</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.18s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

