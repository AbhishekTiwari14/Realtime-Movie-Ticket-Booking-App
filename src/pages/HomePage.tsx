import { MoviesList } from "@/components/MoviesList"
import { dailyTaskUpdates } from "@/lib/generateMovieData"
import { useEffect } from "react"

export function Homepage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      dailyTaskUpdates()
    }, 10000)

    return () => clearTimeout(timer)
  }, [])
  return <MoviesList />
}
