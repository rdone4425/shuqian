import { ref } from 'vue'

export function useDebounce(fn, delay = 300) {
  const timer = ref(null)
  
  return (...args) => {
    if (timer.value) clearTimeout(timer.value)
    timer.value = setTimeout(() => {
      fn(...args)
      timer.value = null
    }, delay)
  }
} 