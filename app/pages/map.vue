<script setup lang="ts">
definePageMeta({ layout: 'default' })

const SITE_URL = 'https://warpulse.news'

useSeoMeta({
  title: 'Live War Map',
  description: 'Track the Iran-Israel war live on an interactive world map. Real-time airstrikes, missile launches, ground operations and political events — AI-verified, community-reported.',
  ogTitle: 'Warpulse — Live Iran-Israel War Map',
  ogDescription: 'Interactive real-time map of the Iran-Israel conflict 2026. Track Operation Midnight Hammer, Tehran airstrikes, missile attacks and military operations as they happen.',
  ogUrl: `${SITE_URL}/map`,
  ogImage: `${SITE_URL}/og.svg`,
  twitterTitle: 'Warpulse — Live War Map | Iran-Israel Conflict 2026',
  twitterDescription: 'Real-time interactive map tracking the Iran-Israel war. Airstrikes, missile attacks, ground operations — live updates with AI verification.',
})

useHead({
  link: [{ rel: 'canonical', href: `${SITE_URL}/map` }],
  script: [
    {
      type: 'application/ld+json',
      key: 'schema-map-dataset',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: 'Warpulse — Iran-Israel War Conflict Events',
        description: 'Real-time dataset of Iran-Israel war events including airstrikes, missile launches, Operation Midnight Hammer, Tehran strikes, ground attacks and political developments.',
        url: `${SITE_URL}/archive`,
        keywords: [
          'iran israel war', 'iran war 2026', 'iran war map', 'iran war news',
          'operation midnight hammer', 'iran missile attack israel', 'tehran airstrikes',
          'middle east conflict 2026', 'israel iran conflict', 'iran nuclear strikes',
          'realtime war events', 'iran war live', 'iran israel conflict tracker',
        ].join(', '),
        creator: { '@type': 'Organization', name: 'Warpulse', url: SITE_URL },
        temporalCoverage: '2026/..',
        spatialCoverage: {
          '@type': 'Place',
          name: 'Middle East',
          geo: { '@type': 'GeoShape', box: '12.0 25.0 42.0 67.0' },
        },
        isAccessibleForFree: true,
        license: 'https://creativecommons.org/licenses/by/4.0/',
      }),
    },
  ],
})
</script>
<template><div /></template>
