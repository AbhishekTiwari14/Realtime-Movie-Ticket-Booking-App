import { getMovies } from "@/apis/MovieApi"
import { Movie } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { MovieGrid } from "./MovieGrid"

export function MoviesList() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["nowPlayingMovies"],
    queryFn: getMovies,
  })

  if (isLoading) return <p>Loading...</p>

  if (error) {
    return (
      <p>
        An error occurred: {error.message} <button>Retry</button>
      </p>
    )
  }

  // Access and display movies data here
  return (
    <div className="px-16 pt-12 bg-slate-50 mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Now Playing Movies</h1>
      <div className="grid grid-cols-4">
        {/* Render your movies data here */}
        {data.results.map((movie: Movie) => (
          <div key={movie.id} className="mx-4">
            <MovieGrid
              title={movie.title}
              poster_path={movie.poster_path}
              vote_average={movie.vote_average}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
