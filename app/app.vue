<script setup lang="ts">
const { init } = useTheme()
onMounted(() => init())

const SITE_URL = 'https://warpulse.news'
const route = useRoute()

useHead({
  titleTemplate: chunk => chunk ? `${chunk} — Warpulse` : 'Warpulse — Real-time Conflict Intelligence',
  link: [{ rel: 'canonical', href: computed(() => `${SITE_URL}${route.path}`) }],
  script: [
    {
      type: 'application/ld+json',
      key: 'schema-website',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Warpulse',
        alternateName: 'Warpulse Conflict Tracker',
        url: SITE_URL,
        description: 'Real-time Iran-Israel war and global conflict event tracking platform with interactive map.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/archive?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }),
    },
    {
      type: 'application/ld+json',
      key: 'schema-org',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'NewsMediaOrganization',
        name: 'Warpulse',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.svg`,
          width: 512,
          height: 512,
        },
        sameAs: [`${SITE_URL}`],
        description: 'Real-time conflict intelligence covering the Iran-Israel war, airstrikes, missile attacks and military operations across the Middle East.',
        foundingDate: '2026',
        publishingPrinciples: SITE_URL,
      }),
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
