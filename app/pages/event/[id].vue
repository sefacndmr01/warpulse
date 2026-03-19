<script setup lang="ts">
import type { WarpulseEvent } from '~/composables/useEvents'

definePageMeta({ layout: 'default' })

const SITE_URL = 'https://warpulse.news'
const route = useRoute()
const { call } = useEdge()

const id = computed(() => typeof route.params.id === 'string' ? route.params.id : '')

const { data: event } = await useAsyncData(
  `event-meta-${id.value}`,
  () => call<WarpulseEvent>(`/events/${id.value}`).catch(() => null),
)

const title = computed(() => event.value?.title ?? 'War Event')
const description = computed(() =>
  event.value?.description?.slice(0, 160)
    ?? 'View this conflict event on the real-time Warpulse war map.',
)

useSeoMeta({
  title,
  description,
  ogTitle: computed(() => event.value?.title),
  ogDescription: computed(() => event.value?.description?.slice(0, 200)),
  ogType: 'article',
  ogUrl: computed(() => `${SITE_URL}/event/${id.value}`),
  ogImage: `${SITE_URL}/og.svg`,
  twitterTitle: title,
  twitterDescription: description,
  twitterCard: 'summary_large_image',
  robots: 'index, follow',
})

useHead({
  link: [{ rel: 'canonical', href: computed(() => `${SITE_URL}/event/${id.value}`) }],
  script: computed(() =>
    event.value
      ? [
          {
            type: 'application/ld+json',
            key: 'schema-event',
            innerHTML: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: event.value.title,
              description: event.value.description ?? undefined,
              datePublished: event.value.created_at,
              dateModified: event.value.created_at,
              author: { '@type': 'Organization', name: 'Warpulse', url: SITE_URL },
              publisher: {
                '@type': 'Organization',
                name: 'Warpulse',
                url: SITE_URL,
                logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
              },
              image: `${SITE_URL}/og.svg`,
              url: `${SITE_URL}/event/${event.value.id}`,
              articleSection: event.value.event_type,
              keywords: [
                'iran israel war', 'iran war 2026', event.value.event_type,
                event.value.location_name, 'middle east conflict', 'war events',
              ].filter(Boolean).join(', '),
              locationCreated: event.value.location_name
                ? { '@type': 'Place', name: event.value.location_name }
                : undefined,
            }),
          },
        ]
      : [],
  ),
})
</script>

<template><div /></template>
