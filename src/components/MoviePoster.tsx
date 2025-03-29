import { getMovie } from "@/apis/getMovie"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import { Star, Clock } from "lucide-react"
import { formatTime } from "@/lib/format_time"
import { formatDate } from "@/lib/format_date"

export default function MoviePoster() {
  const { movieId } = useParams()

  const { data, error, isLoading } = useQuery({
    queryKey: ["movieDetails", movieId],
    queryFn: () => getMovie(movieId),
    enabled: !!movieId,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading)
    return (
      <div className="w-full h-screen rounded bg-gray-600 animate-pulse"></div>
    )
  if (error) return <p>An error occurred: {error.message}</p>

  return (
    <>
      <div className="relative w-full h-screen">
        <div
          className="absolute top-0 left-0 w-full h-screen bg-cover bg-center"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${data.backdrop_path})`,
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-black to-transparent opacity-50"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
          <div className="flex flex-col md:flex-row items-center">
            <img
              src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
              alt={data.title}
              className="w-64 rounded-lg shadow-lg mb-6 hidden md:block"
            />

            <div className="text-white w-2/3 md:w-1/3 flex flex-col gap-3 ml-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center md:text-left">
                {data.title}
              </h1>
              <div className="bg-[rgb(51,51,51)] flex flex-row justify-between items-center py-3 px-4 md:px-6 rounded-lg">
                <span className="text-white font-semibold text-base md:text-lg mb-2 sm:mb-0">
                  <Star
                    color="yellow"
                    className="fill-yellow-400 inline mr-2"
                  />{" "}
                  {data.vote_average < 1
                    ? "Not Rated Yet"
                    : data.vote_average.toFixed(1) + " /10"}
                </span>
                <span className="font-semibold">
                  <Clock className="inline mr-2" />
                  {formatTime(data.runtime)}
                </span>
              </div>

              <p className="text-lg md:text-xl mt-2 text-center md:text-left">
                {data.genres
                  .map((genre: { id: number; name: string }) => genre.name)
                  .join("  |  ")}
              </p>
              <p className="text-lg md:text-xl mb-4 text-center md:text-left">
                {formatDate(data.release_date)}
              </p>
              <Link
                to={`/${movieId}/select-show`}
                className="self-center md:self-start"
              >
                <button className="bg-red-600 px-8 md:px-12 py-2 md:py-3 rounded-xl font-semibold text-lg md:text-xl text-center hover:bg-red-700">
                  Book Tickets{" "}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="py-8 md:py-12 mx-8 px-4 max-w-screen md:w-4/5 lg:w-3/5">
        <p className="text-xl md:text-2xl font-bold mb-3">About the movie</p>
        <p className="text-sm md:text-md font-medium text-gray-800">
          {data.overview}
        </p>
      </div>
    </>
  )
}
