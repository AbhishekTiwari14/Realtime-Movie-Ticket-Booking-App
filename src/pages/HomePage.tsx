import { MoviesList } from "@/components/MoviesList"
import { dailyTaskUpdates } from "@/lib/generateMovieData"

export function Homepage() {
  dailyTaskUpdates()
  return <MoviesList />
}
