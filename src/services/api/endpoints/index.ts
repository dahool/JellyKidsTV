import { store } from '~/store'

function primaryThumb(itemId: string) {
  const state = store.getState()
  return `${state.auth.hostUrl}/Items/${itemId}/Images/Primary`
}

function video(itemId: string) {
  const state = store.getState()
  return `${state.auth.hostUrl}/Videos/${itemId}/stream?static=true&mediaSourceId=${itemId}&api_key=${state.auth.apiKey}`
}

export const endpoint = {
  primaryThumb,
  video
}
