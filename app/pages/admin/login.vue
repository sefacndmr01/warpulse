<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const router = useRouter()
const { call } = useEdge()

const password = ref('')
const busy = ref(false)
const err = ref<string | null>(null)

onMounted(() => {
  if (import.meta.client && localStorage.getItem('wp_edge_admin'))
    router.replace('/admin')
})

const submit = async () => {
  if (!password.value.trim()) return
  err.value = null
  busy.value = true
  try {
    const res = await call<{ token: string }>('/admin/login', {
      method: 'POST',
      body: { password: password.value },
    })
    localStorage.setItem('wp_edge_admin', res.token)
    await router.replace('/admin')
  } catch (e: unknown) {
    err.value = (e as { data?: { message?: string } })?.data?.message ?? 'Login failed'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-3rem)] flex items-center justify-center py-10">
    <div class="w-full max-w-[420px] bg-card border border-border rounded-2xl p-5">
      <div class="mb-4">
        <h1 class="text-[14px] font-semibold text-ink">Admin access</h1>
        <p class="text-[12px] text-muted mt-1">Enter the admin password to continue.</p>
      </div>

      <label class="block text-[10px] font-semibold text-muted uppercase tracking-widest mb-1.5">Password</label>
      <input v-model="password" type="password" class="field" placeholder="••••••••" @keydown.enter="submit" />
      <p v-if="err" class="text-[12px] text-red-500 mt-2">{{ err }}</p>

      <button class="btn-primary w-full justify-center py-2.5 mt-4 rounded-lg text-[13px]" :disabled="busy || !password.trim()" @click="submit">
        {{ busy ? 'Signing in...' : 'Sign in' }}
      </button>
    </div>
  </div>
</template>
