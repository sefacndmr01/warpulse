export interface SubmitForm {
  title: string
  description: string
  source_url: string
  event_type: string
  lat: number | null
  lng: number | null
  location_name: string
}

export const useSubmit = () => {
  const { call } = useEdge()

  const open       = useState('submit-modal-open',  () => false)
  const step       = useState<1 | 2>('submit-step', () => 1)
  const loading    = useState('submit-loading',      () => false)
  const error      = useState<string | null>('submit-error', () => null)
  const success    = useState('submit-success',      () => false)
  const verifying  = useState('submit-verifying',    () => false)
  const aiApproved = useState<boolean | null>('submit-ai-approved', () => null)

  const form = useState<SubmitForm>('submit-form', () => ({
    title: '', description: '', source_url: '', event_type: 'attack',
    lat: null, lng: null, location_name: '',
  }))

  const reset = () => {
    form.value       = { title: '', description: '', source_url: '', event_type: 'attack', lat: null, lng: null, location_name: '' }
    step.value       = 1
    error.value      = null
    success.value    = false
    verifying.value  = false
    aiApproved.value = null
  }

  const openModal = (preset?: Partial<SubmitForm>) => {
    reset()
    if (preset) Object.assign(form.value, preset)
    open.value = true
  }

  const closeModal = () => { open.value = false; reset() }

  const submit = async (): Promise<string | null> => {
    if (!form.value.title.trim())                                    { error.value = 'Title is required'; return null }
    if (!form.value.event_type)                                      { error.value = 'Event type is required'; return null }
    if (form.value.lat === null || form.value.lng === null)          { error.value = 'Please pick a location on the map'; return null }

    loading.value = true
    error.value   = null
    try {
      const result = await call<{ id: string; status: string }>('/events', {
        method: 'POST',
        body: {
          title:         form.value.title,
          description:   form.value.description  || undefined,
          source_url:    form.value.source_url   || undefined,
          event_type:    form.value.event_type,
          lat:           form.value.lat,
          lng:           form.value.lng,
          location_name: form.value.location_name || undefined,
        },
      })
      verifying.value = true
      return result.id
    } catch (e: unknown) {
      error.value = (e as { data?: { message?: string } })?.data?.message ?? 'Submission failed'
      return null
    } finally {
      loading.value = false
    }
  }

  const setVerified = (approved: boolean) => {
    aiApproved.value = approved
    verifying.value  = false
    success.value    = true
    setTimeout(closeModal, approved ? 3500 : 4500)
  }

  return { open, step, loading, error, success, verifying, aiApproved, form, openModal, closeModal, submit, reset, setVerified }
}
