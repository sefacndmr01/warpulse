export const usePanel = () => {
  const open = useState('panel-open', () => false)
  return { open }
}
