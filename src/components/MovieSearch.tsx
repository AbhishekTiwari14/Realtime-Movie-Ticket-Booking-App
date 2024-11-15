import { getMovies } from "@/apis/getMovies"
import { Movie } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

export function MovieSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data, error, isLoading } = useQuery({
    queryKey: ["nowPlayingMovies"],
    queryFn: getMovies,
  })

  // Debounce effect for search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && data?.results) {
        setFilteredMovies(
          data.results.filter((m: Movie) =>
            m.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
        setShowRecommendations(true)
      } else {
        setFilteredMovies([])
        setShowRecommendations(false)
      }
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [searchQuery, data?.results])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowRecommendations(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (isLoading) return <p>Loading...</p>

  if (error) {
    return (
      <p>
        An error occurred: {error.message} <button>Retry</button>
      </p>
    )
  }

  return (
    <div ref={containerRef} className="relative w-2/5">
      <img
        src="/searchIcon.svg"
        alt="search icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
      />
      <input
        type="search"
        name="movieSearch"
        id="movieSearch"
        ref={inputRef}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowRecommendations(!!searchQuery)}
        placeholder="Search for Movies"
        className="w-full border-gray-100 border-2 pl-12 pr-6 py-2 rounded-3xl"
      />
      {showRecommendations && filteredMovies.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border rounded-md shadow-lg">
          {filteredMovies.map((movie) => (
            <Link
              to={movie.id.toString()}
              key={movie.id}
              onClick={() => {
                setShowRecommendations(false)
                setSearchQuery("")
              }}
            >
              <p className="p-2 hover:bg-blue-100 cursor-pointer font-semibold">
                {movie.title}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
