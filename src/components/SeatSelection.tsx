import { useState, useEffect, Fragment } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { doc, onSnapshot } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader2, Pencil } from "lucide-react"
import { MovieSchedule, Seat, SeatStatus } from "@/types"
import { db } from "@/lib/firebase"
import { SetSeatCount } from "./SetSeatCount"
import { convertSeatIdToIndex } from "@/lib/convertSeatIdToIndex"
import { useQuery } from "@tanstack/react-query"
import { getMovie } from "@/apis/getMovie"
import { bookSeats } from "@/lib/bookSeats"
import { startSeatReleaseTimeout } from "@/lib/startSeatReleaseTimeout"
import toast from "react-hot-toast"

const SeatSelection = () => {
  const { docId } = useParams()
  const [open, setOpen] = useState(true)
  const [seatsCount, setSeatsCount] = useState<number>(2)
  const [selectedSeatsCount, setSelectedSeatsCount] = useState<number>(0)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [price, setPrice] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [movieDetails, setMovieDetails] = useState<Omit<
    MovieSchedule,
    "seats"
  > | null>(null)

  useEffect(() => {
    if (!docId) {
      setError("No document ID provided")
      setLoading(false)
      return
    }

    try {
      const movieScheduleRef = doc(db, "movieSchedules", docId)

      const unsubscribe = onSnapshot(
        movieScheduleRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            if (data) {
              setMovieDetails({
                movieTitle: data.movieTitle,
                theaterName: data.theaterName,
                showTime: data.showTime,
                date: data.date,
                month: data.month,
                day: data.day,
              })
            }
            const seatsData = data.seats as Seat[]
            setSeats(seatsData)
            setLoading(false)
          } else {
            console.error(`Document ${docId} not found`)
            setError(`Schedule not found`)
            setLoading(false)
            return
          }
        },
        (error) => {
          console.error("Error fetching seats:", error)
          setError("Error loading seats: " + error.message)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up snapshot:", error)
      setError("Error initializing: " + (error as Error).message)
      setLoading(false)
    }
  }, [docId])

  useEffect(() => {
    if (selectedSeatsCount === seatsCount) setPrice(120 * seatsCount)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeatsCount])

  useEffect(() => {
    setSelectedSeats([])
    setSelectedSeatsCount(0)
    setPrice(0)
  }, [seatsCount])

  const navigate = useNavigate()

  const movieId = docId?.split("_")[0]

  const { data } = useQuery({
    queryKey: ["movieDetails", movieId],
    queryFn: () => getMovie(movieId),
    enabled: !!movieId,
    staleTime: 5 * 60 * 1000,
  })

  function updateSeatCount(val: number) {
    setSeatsCount(val)
  }

  function setPopoverOpen() {
    setOpen(false)
  }

  const handleSeatClick = async (seatId: string) => {
    if (!docId) return
    try {
      if (selectedSeats.includes(seatId)) return
      if (selectedSeatsCount === seatsCount) {
        setSelectedSeatsCount(0)
        setSelectedSeats([])
      }
      const consecutiveSeatsArray = selectRowAutomatically(seatId)
      if (consecutiveSeatsArray.length > 0) {
        if (selectedSeatsCount === 0) {
          setSelectedSeats(consecutiveSeatsArray)
          setSelectedSeatsCount(consecutiveSeatsArray.length)
        } else {
          setSelectedSeats((prevSeats) => [
            ...prevSeats,
            ...consecutiveSeatsArray,
          ])
          setSelectedSeatsCount((prev) => prev + consecutiveSeatsArray.length)
        }
      }
      if (selectedSeatsCount === seatsCount) setPrice(120 * seatsCount)
    } catch (error) {
      console.error("Error updating seat:", error)
      setError("Error updating seat: " + (error as Error).message)
    }
  }

  const selectRowAutomatically = (seatId: string): string[] => {
    const consecutiveSeatsArray: string[] = [seatId]
    const row = seatId[0]
    const seatNumber = parseInt(seatId.slice(1))
    if (selectedSeatsCount + 1 === seatsCount) return consecutiveSeatsArray
    let remainingSeats = seatsCount - selectedSeatsCount - 1
    if (selectedSeatsCount === seatsCount) remainingSeats = seatsCount - 1
    if (seatNumber < 12) {
      let i = seatNumber + 1
      let currSeatId = row + i.toString()
      let index = convertSeatIdToIndex(currSeatId)
      while (
        i <= 12 &&
        remainingSeats > 0 &&
        seats[index]?.status === "available"
      ) {
        consecutiveSeatsArray.push(currSeatId)
        i++
        currSeatId = row + i.toString()
        index = convertSeatIdToIndex(currSeatId)
        remainingSeats--
      }
    }
    if (seatNumber > 1 && remainingSeats > 0) {
      let i = seatNumber - 1
      let currSeatId = row + i.toString()
      let index = convertSeatIdToIndex(currSeatId)
      while (
        i >= 1 &&
        remainingSeats > 0 &&
        seats[index]?.status === "available"
      ) {
        consecutiveSeatsArray.push(currSeatId)
        i--
        currSeatId = row + i.toString()
        index = convertSeatIdToIndex(currSeatId)
        remainingSeats--
      }
    }
    return consecutiveSeatsArray
  }

  const getSeatColor = (status: SeatStatus, id: string) => {
    if (selectedSeats.includes(id)) {
      return "border-green-400 bg-green-600 text-white"
    } else if (status === "available")
      return "border-green-400 bg-white hover:bg-green-600 hover:text-white"
    else if (status === "booked" || status === "selected")
      return "border-gray-400 bg-gray-400 text-white cursor-not-allowed pointer-events-none"
    return "border-gray-400 bg-gray-400 text-white cursor-not-allowed pointer-events-none"
  }

  const date = docId?.split("_")[1]
  const theater = docId?.split("_")[2]
  const showtime = docId?.split("_")[3]

  const handleProceedToPayment = async () => {
    for (const seatId of selectedSeats) {
      const index = convertSeatIdToIndex(seatId)
      if (seats[index].status === "available") continue
      else {
        toast.error("Selected seats have already been booked")
        setSelectedSeats([])
        setSelectedSeatsCount(0)
        return
      }
    }

    await bookSeats(docId as string, selectedSeats, "selected")

    startSeatReleaseTimeout(docId as string, selectedSeats)

    const paymentData = {
      amount: price,
      movieTitle: data.title,
      date,
      theater,
      seats: selectedSeats,
      showtime,
      docId,
    }

    navigate(`/booking/${docId}/payment`, { state: paymentData })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  const seatsArray = Object.values(seats)
  const seatsByRow = seatsArray.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = []
    }
    acc[seat.row].push(seat)
    return acc
  }, {} as Record<string, Seat[]>)

  const sortedRows = Object.keys(seatsByRow).sort()

  return (
    <>
      {open && (
        <div className="flex fixed inset-0 lg:hidden items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-12 rounded-md shadow-lg flex justify-center items-center">
            <SetSeatCount
              seatCount={seatsCount}
              updateSeatCount={updateSeatCount}
              setPopoverOpen={setPopoverOpen}
            />
          </div>
        </div>
      )}
      <div
        className={`${
          open ? "hidden lg:flex" : "flex"
        }  justify-between items-center w-full mx-auto px-2 py-4 bg-gray-200 text-black bg-opacity-50 `}
      >
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center cursor-pointer hover:bg-gray-300 hover:bg-opacity-30 p-1 rounded-full"
            aria-label="Go back"
          >
            <ChevronLeft className="ml-1 mr-3" />
          </button>
          <div className="flex flex-col font-semibold text-sm">
            <p className="font-semibold text-lg">{movieDetails?.movieTitle}</p>
            <p>
              {movieDetails?.date} {movieDetails?.month} | {movieDetails?.day} |{" "}
              {movieDetails?.showTime}{" "}
              {parseInt(movieDetails?.showTime || "0") >= 12 ? "pm" : "am"} |{" "}
              {movieDetails?.theaterName}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setOpen(!open)}
            className="mr-6 px-2 py-1 text-black border-2 rounded flex items-center gap-5"
          >
            {seatsCount} Tickets
            <Pencil className="h-4 w-4" />
          </button>
          {open && (
            <div className="hidden fixed inset-0 lg:flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div className="bg-white p-12 rounded-md shadow-lg flex justify-center items-center">
                <SetSeatCount
                  seatCount={seatsCount}
                  updateSeatCount={updateSeatCount}
                  setPopoverOpen={setPopoverOpen}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className={`mx-auto p-12 shadow-lg bg-gray-100 bg-opacity-30 space-y-4`}
      >
        {sortedRows.map((row) => (
          <div key={row} className="flex items-center">
            {/* Row label */}
            <div className="font-medium text-black text-center w-8 shrink-0">
              {row}
            </div>

            {/* Seats */}
            <div className="flex justify-center items-center gap-4 flex-1 ml-2">
              {seatsByRow[row]
                .sort((a, b) => a.number - b.number)
                .map((seat) => (
                  <Fragment key={seat.id}>
                    {(seat.number === 3 || seat.number === 11) && (
                      <div className="w-8 shrink-0"></div>
                    )}
                    <Button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id)}
                      className={`w-8 h-8 flex shrink-0 items-center justify-center rounded text-green-400 border-2 ${getSeatColor(
                        seat.status,
                        seat.id
                      )}`}
                      disabled={seat.status === "booked"}
                    >
                      {seat.number}
                    </Button>
                  </Fragment>
                ))}
            </div>
          </div>
        ))}
        <div className="flex flex-col mb-16 justify-center items-center">
          <p className="text-sm">screen this way !</p>
          <div className="w-1/4 h-2 bg-gray-600 rounded"></div>
        </div>
      </div>
      <div className="h-16" />
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-sm border-2 border-green-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Avalilable</p>
                <p className="text-xs text-gray-500">
                  seats available to be booked
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-sm border-2 bg-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Selected</p>
                <p className="text-xs text-gray-500">seats selected by you</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-sm border-2 bg-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Sold</p>
                <p className="text-xs text-gray-500">
                  already booked by others
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {price > 0 && !open && (
        <>
          <div className="h-16" />
          <div className="fixed z-50 bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-4xl mx-auto px-4 py-3">
              <div className="flex items-center justify-center">
                <button
                  onClick={handleProceedToPayment}
                  className="bg-red-500 hover:bg-red-600 text-white px-24 py-3 rounded-lg font-medium text-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Pay Rs. {price}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default SeatSelection
