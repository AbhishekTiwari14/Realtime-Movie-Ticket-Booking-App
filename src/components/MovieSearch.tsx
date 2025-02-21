import { getMovies } from "@/apis/getMovies"
import { Movie } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export function MovieSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([])

  const { data, error, isLoading } = useQuery({
    queryKey: ["nowPlayingMovies"],
    queryFn: getMovies,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && data?.results) {
        setFilteredMovies(
          data.results.filter((m: Movie) =>
            m.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
        setShowRecommendations(true)
        setFocusedIndex(-1) 
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

  useEffect(() => {
    resultRefs.current = resultRefs.current.slice(0, filteredMovies.length)
  }, [filteredMovies])

  const navigate = useNavigate()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showRecommendations || filteredMovies.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setFocusedIndex((prevIndex) =>
        prevIndex < filteredMovies.length - 1 ? prevIndex + 1 : prevIndex
      )
    }

    else if (e.key === "ArrowUp") {
      e.preventDefault()
      setFocusedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : -1))
    }

    else if (e.key === "Escape") {
      setShowRecommendations(false)
      inputRef.current?.focus()
    }

    else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault()
      selectMovie(filteredMovies[focusedIndex])
    }
  }

  useEffect(() => {
    if (focusedIndex >= 0 && resultRefs.current[focusedIndex]) {
      resultRefs.current[focusedIndex]?.focus()
    }
  }, [focusedIndex])

  const selectMovie = (movie: Movie) => {
    setShowRecommendations(false)
    setSearchQuery("")
    navigate(`/${movie.id}`)
  }

  if (isLoading) return <p>Loading...</p>

  if (error) {
    return (
      <p>
        An error occurred:{" "}
        {error instanceof Error ? error.message : "Unknown error"}{" "}
        <button>Retry</button>
      </p>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-3/5 lg:w-2/5"
      role="search"
      aria-label="Movie search"
    >
      <img
        src="/searchIcon.svg"
        alt=""
        aria-hidden="true"
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
        onKeyDown={handleKeyDown}
        placeholder="Search for Movies"
        className="w-full border-gray-100 border-2 pl-12 pr-6 py-2 rounded-3xl"
        aria-autocomplete="list"
        aria-controls="search-results"
        aria-expanded={showRecommendations && filteredMovies.length > 0}
        aria-activedescendant={
          focusedIndex >= 0 ? `result-${filteredMovies[focusedIndex]?.id}` : ""
        }
      />
      {showRecommendations && filteredMovies.length > 0 && (
        <div
          id="search-results"
          className="absolute z-50 w-full mt-2 bg-white border rounded-md shadow-lg"
          role="listbox"
          aria-label="Search suggestions"
        >
          {filteredMovies.map((movie, index) => (
            <Link
              ref={(el) => (resultRefs.current[index] = el)}
              to={movie.id.toString()}
              key={movie.id}
              id={`result-${movie.id}`}
              onClick={() => selectMovie(movie)}
              onMouseEnter={() => setFocusedIndex(index)}
              onKeyDown={handleKeyDown}
              className={`block p-2 ${
                focusedIndex === index ? "bg-blue-100" : "hover:bg-blue-100"
              } cursor-pointer font-semibold outline-none focus:ring-2 focus:ring-blue-400`}
              role="option"
              aria-selected={focusedIndex === index}
              tabIndex={-1}
            >
              {movie.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
