export const useEdge = () => {
  const { public: cfg } = useRuntimeConfig()
  const base = `${cfg.supabaseUrl}/functions/v1`

  const adminToken = (): string =>
    import.meta.client ? (localStorage.getItem('wp_edge_admin') ?? '') : ''

  const call = <T = unknown>(path: string, opts: Parameters<typeof $fetch>[1] = {}) =>
    $fetch<T>(`${base}${path}`, opts)

  const adminCall = <T = unknown>(path: string, opts: Parameters<typeof $fetch>[1] = {}) =>
    $fetch<T>(`${base}${path}`, {
      ...opts,
      headers: { ...(opts.headers as Record<string, string> ?? {}), 'x-admin-token': adminToken() },
    })

  return { call, adminCall }
}
