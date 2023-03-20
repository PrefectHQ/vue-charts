import { ref, Ref } from 'vue'

export type UseCursor = {
  cursor: Ref<Date | null>,
}

export function useCursorFactory(): () => UseCursor {
  const cursor = ref<Date | null>(null)

  return () => ({
    cursor,
  })
}

export const useCursor = useCursorFactory()