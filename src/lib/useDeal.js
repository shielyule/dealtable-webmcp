import { useEffect, useState } from 'react'
import { getState, subscribe } from './dealStore.js'

export function useDeal() {
  const [state, setState] = useState(getState)
  useEffect(() => subscribe(setState), [])
  return state
}
