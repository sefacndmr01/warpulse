<script setup lang="ts">
const { openModal } = useSubmit()
const { theme, toggle } = useTheme()
const router = useRouter()

const legalOpen = ref(false)
</script>

<template>
  <div class="absolute top-2.5 right-2.5 z-[5000]">
    <div class="flex items-center gap-1 bg-card border border-border rounded-xl px-1.5 py-1 shadow-md">
      <button
        class="h-7 px-2 inline-flex items-center gap-1.5 rounded-lg text-[12px] font-medium text-ink hover:bg-surface transition-colors"
        title="Report an event"
        @click="openModal()"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 1.5V11.5M1.5 6.5H11.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        Report Event
      </button>

      <div class="w-px h-4 bg-border" />

      <button
        class="w-7 h-7 inline-flex items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
        :title="theme === 'dark' ? 'Light mode' : 'Dark mode'"
        @click="toggle()"
      >
        <svg v-if="theme === 'dark'" width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" stroke-width="1.3"/>
          <path d="M6.5 1v1M6.5 11v1M1 6.5h1M11 6.5h1M2.636 2.636l.707.707M9.657 9.657l.707.707M2.636 10.364l.707-.707M9.657 3.343l.707-.707" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        <svg v-else width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M11 7.2C10.4 9.2 8.6 10.8 6.5 10.8C4.015 10.8 2 8.785 2 6.3C2 4.2 3.6 2.4 5.6 1.8C5 2.7 4.7 3.8 4.7 5C4.7 7.264 6.536 9.1 8.8 9.1C9.9 9.1 11 8.8 11 7.2Z" fill="currentColor"/>
        </svg>
      </button>

      <div class="w-px h-4 bg-border" />

      <button
        class="h-7 px-2 inline-flex items-center rounded-lg text-[12px] font-medium text-dim hover:text-ink hover:bg-surface transition-colors"
        title="Archive"
        @click="router.push('/archive')"
      >
        Archive
      </button>

      <div class="w-px h-4 bg-border" />

      <button
        class="h-7 px-2 inline-flex items-center rounded-lg text-[12px] font-medium text-dim hover:text-ink hover:bg-surface transition-colors"
        title="Disclaimer"
        @click="legalOpen = true"
      >
        Disclaimer
      </button>
    </div>

    <LegalModal :open="legalOpen" @close="legalOpen = false" />
  </div>
</template>

