import { MovieDetails } from "@/components/MovieDetails"
import { MoviePoster } from "@/components/MoviePoster"
import { dailyTaskUpdates } from "@/lib/generateMovieData"

export function Moviepage() {
  dailyTaskUpdates()
  return (
    <>
      <MoviePoster />
      <MovieDetails />
    </>
  )
}
