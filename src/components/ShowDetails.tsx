import { getMovie } from "@/apis/getMovie"
import { formatTime } from "@/lib/format_time"
import { useQuery } from "@tanstack/react-query"
import { Clock } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { getWeekDetails } from "../lib/getWeekDetails"
import { useState } from "react"
import { generateTheatersData } from "@/lib/generateMovieData"

export function ShowDetails() {
  const navigate = useNavigate()
  const week = getWeekDetails()
  const currDate = week[0].date
  const [dateSelected, setDateSelected] = useState(currDate)
  const { movieId } = useParams()

  const { data, error, isLoading } = useQuery({
    queryKey: ["movieDetails", movieId],
    queryFn: () => getMovie(movieId),
    enabled: !!movieId,
  })

  const handleShowtimeClick = (theaterId: string, showTime: string) => {

    const selectedDateData = week.find((d) => d.date === dateSelected)

    // Generate the docId
    const dateString = `${dateSelected}${selectedDateData?.month}`
    const docId = `${movieId}_${dateString}_${theaterId}_${showTime.replace(
      ":",
      ""
    )}`

    navigate(`/booking/${docId}`)
  }

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>An error occurred: {error.message}</p>

  const theaterData = generateTheatersData()

  return (
    <>
      <div className="hidden md:grid grid-cols-3 mt-12 mr-auto ml-24 gap-16">
        <img
          src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
          alt={data.title}
          className="w-64 rounded-lg shadow-lg mr-8"
        />
        <div className="flex flex-col gap-4 justify-center">
          <h1 className="text-4xl font-bold">{data.title}</h1>
          <span className="font-semibold">
            <Clock className="inline mr-2" />
            {formatTime(data.runtime)}
          </span>
          <p>
            {data.genres.map((genre: { id: number; name: string }) => (
              <span key={genre.id} className="px-2 border border-gray-300">
                {genre.name}
              </span>
            ))}
          </p>
          <div className="hidden lg:block text-balance">{data.overview}</div>
        </div>
      </div>
      <hr className="ml-12 mr-24 mt-8" />
      <div className="flex flex-row gap-4 ml-6 md:ml-12 lg:ml-16">
        {week.map((d) => (
          <div
            key={d.date}
            className={`mt-4 flex flex-col py-1 px-4 rounded-lg gap-0 justify-center items-center ${
              d.date === dateSelected
                ? "bg-red-600 text-white"
                : "hover:text-red-600 hover:cursor-pointer"
            }`}
            onClick={() => setDateSelected(d.date)}
          >
            <p className="text-sm font-medium">{d.day}</p>
            <p className="text-md font-semibold">{d.date}</p>
            <p className="text-sm font-medium">{d.month}</p>
          </div>
        ))}
      </div>
      <hr className="ml-12 mr-24 mt-4 mb-12" />
      {theaterData.map((theater) => (
        <div key={theater.id}>
          <div className="flex ml-12 mb-4 items-center">
            <p className="text-lg font-semibold">{theater.name} : </p>
            <div className="flex justify-evenly">
              {theater.showTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => handleShowtimeClick(theater.id, time)}
                  className="justify-around p-1 lg:p-1 mx-4 border-black border-2 rounded-lg text-green-700 hover:text-red-700 text-sm md:text-base font-medium"
                >
                  {time} {parseInt(time.split(":")[0], 10) >= 12 ? "pm" : "am"}
                </button>
              ))}
            </div>
          </div>
          <hr className="ml-12 mr-24 mt-4 mb-8" />
        </div>
      ))}
    </>
  )
}
