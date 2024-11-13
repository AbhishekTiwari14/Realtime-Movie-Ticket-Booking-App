import { getMovie } from "@/apis/getMovie"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import { Star, Clock } from "lucide-react"
import { formatTime } from "@/lib/format_time"
import { formatDate } from "@/lib/format_date"

export function MoviePoster() {
  const { movieId } = useParams() // Get movieId from the URL

  const { data, error, isLoading } = useQuery({
    queryKey: ["movieDetails", movieId], // Add movieId to queryKey
    queryFn: () => getMovie(movieId), // Fetch details for the specific movie
    enabled: !!movieId, // Ensure the query only runs when movieId is available
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>An error occurred: {error.message}</p>

  console.log("data", data)

  return (
    <>
      <div className="relative">
        {/* Backdrop Image */}
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${data.backdrop_path})`,
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-black to-transparent opacity-50"></div>
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="flex items-center">
            {/* Poster Image */}
            <img
              src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
              alt={data.title}
              className="w-48 md:w-64 rounded-lg shadow-lg mr-8"
            />

            {/* data Info */}
            <div className="text-white w-1/3 flex flex-col gap-3">
              <h1 className="text-4xl font-bold">{data.title}</h1>
              <div className="bg-[rgb(51,51,51)] flex justify-between items-center py-3 px-6 rounded-lg">
                <span className="text-white font-semibold text-lg">
                  <Star
                    color="yellow"
                    className="fill-yellow-400 inline mr-2"
                  />{" "}
                  {data.vote_average.toFixed(1)}/10 ({data.vote_count} votes)
                </span>
                <span className="font-semibold">
                  <Clock className="inline mr-2" />
                  {formatTime(data.runtime)}
                </span>
              </div>

              <p className="text-xl mt-2">
                {data.genres
                  .map((genre: { id: number; name: string }) => genre.name)
                  .join("  |  ")}
              </p>
              <p className="text-xl mb-4">{formatDate(data.release_date)}</p>
              <Link to="/">
                <button className="bg-red-600 px-12 py-3 rounded-xl font-semibold text-xl text-center hover:bg-red-700">
                  Book Tickets{" "}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-16 px-16 w-3/5">
        <p className="text-2xl font-bold mb-3">About the movie</p>
        <p className="text-md font-medium text-gray-800">{data.overview}</p>
      </div>
    </>
  )
}
