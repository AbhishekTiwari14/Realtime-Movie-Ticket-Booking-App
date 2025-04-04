import MoviesList from "@/components/MoviesList"
import { dailyTaskUpdates } from "@/lib/generateMovieData"
import { useEffect, useRef } from "react"

export function Homepage() {
  const hasRunUpdate = useRef(false)

  useEffect(() => {
    // Only run dailyTaskUpdates once per session
    if (!hasRunUpdate.current) {
      const timer = setTimeout(() => {
        dailyTaskUpdates()
        hasRunUpdate.current = true
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [])

  return <MoviesList />
}
