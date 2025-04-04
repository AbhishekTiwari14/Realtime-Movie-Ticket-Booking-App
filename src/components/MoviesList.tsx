import { getMovies } from "@/apis/getMovies"
import { Movie } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRef, useState, useEffect } from "react"

export default function MoviesList() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["nowPlayingMovies"],
    queryFn: getMovies,
    staleTime: 60 * 60 * 1000,
  })

  const MovieCard = ({ movie }: { movie: Movie }) => {
    const imageRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
      const currentRef = imageRef.current // Store ref value to use in cleanup

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsVisible(true)
            // Once the image is loaded, disconnect the observer
            observer.disconnect()
          }
        },
        { rootMargin: "200px" }
      )

      if (currentRef) {
        observer.observe(currentRef)
      }

      return () => {
        // Use the stored ref value for cleanup
        if (currentRef) {
          observer.disconnect()
        }
      }
    }, [])

    return (
      <div className="movie-card-container">
        <Link
          to={movie.id.toString()}
          className="block transform transition duration-200 hover:scale-105"
        >
          <div className="relative rounded-lg overflow-hidden shadow-lg bg-white">
            <div ref={imageRef} className="relative aspect-[2/3]">
              {isVisible ? (
                <picture>
                  <source
                    media="(min-width: 1024px)"
                    srcSet={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  />
                  <source
                    media="(min-width: 768px)"
                    srcSet={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                  />
                  <img
                    src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </picture>
              ) : (
                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-3">
              <h2 className="truncate text-sm font-semibold mb-1">
                {movie.title}
              </h2>
              <div className="flex items-center text-sm text-yellow-400">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1">
                  {movie.vote_average < 1
                    ? "Not rated yet"
                    : movie.vote_average.toFixed(1) + "/10"}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    )
  }

  const LoadingSkeleton = () => (
    <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
      <Skeleton className="absolute inset-0" />
      <Skeleton className="absolute bottom-0 left-0 right-0 h-10" />
    </div>
  )

  if (error) {
    return (
      <Alert variant="destructive" className="mx-16 mt-12">
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load movies: {(error as Error).message}</span>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="px-4 md:px-8 lg:px-16 pt-12 bg-slate-50">
      <h1 className="text-2xl font-semibold mb-8">Now Playing Movies</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {isLoading
          ? Array(10)
              .fill(0)
              .map((_, index) => <LoadingSkeleton key={`skeleton-${index}`} />)
          : data?.results?.map((movie: Movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
      </div>
    </div>
  )
}
