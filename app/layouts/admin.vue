<script setup lang="ts">
const { theme } = useTheme()
</script>

<template>
  <div class="min-h-screen bg-canvas text-ink">
    <div class="sticky top-0 z-[4000] border-b border-border bg-card/95 backdrop-blur">
      <div class="h-12 px-4 flex items-center justify-between">
        <NuxtLink to="/map" class="inline-flex items-center gap-2">
          <img src="/logo.svg" alt="Warpulse" class="h-[22px] w-auto" :class="{ invert: theme === 'dark' }" />
          <span class="text-[12px] font-semibold text-dim">Admin</span>
        </NuxtLink>
        <div class="flex items-center gap-3">
          <NuxtLink to="/map" class="text-[12px] font-medium text-dim hover:text-ink transition-colors">Map</NuxtLink>
        </div>
      </div>
    </div>

    <main class="max-w-[1100px] mx-auto px-4 py-5">
      <slot />
    </main>
  </div>
</template>

