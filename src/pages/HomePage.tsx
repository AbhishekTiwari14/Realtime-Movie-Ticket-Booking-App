import { MoviesList } from "@/components/MoviesList"
import { dailyTaskUpdates } from "@/lib/generateMovieData"
import { useEffect } from "react"

export function Homepage() {
  useEffect(() => {
    dailyTaskUpdates()
  }, [])
  return <MoviesList />
}
