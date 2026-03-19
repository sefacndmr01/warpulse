export interface TwitterMeta {
  username: string
  tweetId: string
  url: string
  displayUrl: string
}

export const parseTwitterUrl = (url: string): TwitterMeta | null => {
  if (!url) return null
  try {
    const u = new URL(url)
    const isTwitter = u.hostname === 'twitter.com' || u.hostname === 'x.com' || u.hostname === 'www.twitter.com' || u.hostname === 'www.x.com'
    if (!isTwitter) return null
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length < 3 || parts[1] !== 'status') return null
    return {
      username: parts[0],
      tweetId: parts[2],
      url,
      displayUrl: `x.com/${parts[0]}/status/${parts[2]}`,
    }
  } catch {
    return null
  }
}
