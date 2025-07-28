import { db } from "@/lib/firebase"
import { Booking } from "@/types"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { format } from "date-fns"
import {
  ArrowUpDown,
  Calendar,
  Clock,
  Film,
  MapPin,
  ChevronLeft,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM dd")
  } catch (error) {
    console.log(error)
    return dateString
  }
}

const formatTime = (timeString: string) => {
  const hour = parseInt(timeString.slice(0, timeString.length - 2))
  return hour >= 12 ? `${hour}:00 pm` : `${hour}:00 am`
}

export default function BookingsHistory() {
  const { userId } = useParams()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof Booking>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])


  const fetchBookings = async () => {
    if (!userId) {
      setError("User ID is required")
      setLoading(false)
      return
    }

    try {
      const bookingDocRef = doc(db, "bookings", userId)
      const bookingDocSnap = await getDoc(bookingDocRef)

      if (bookingDocSnap.exists()) {
        const data = bookingDocSnap.data()
        setBookings(data.bookings || [])
      } else {
        setBookings([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const sortBookings = (field: keyof Booking) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortedBookings = () => {
    return [...bookings].sort((a, b) => {
      const aVal = sortField === "date" ? new Date(a.date) : a[sortField];
      const bVal = sortField === "date" ? new Date(b.date) : b[sortField];
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }

  const renderSortIcon = (field: keyof Booking) => {
    return (
      <ArrowUpDown
        className={cn(
          "ml-2 h-4 w-4 inline",
          sortField === field ? "opacity-100" : "opacity-50"
        )}
      />
    )
  }

  const theaterName = ["Fun", "PVR", "Cinepolis", "Inox"]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Loading your booking history...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center p-6 text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <Button variant="outline" onClick={fetchBookings}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <CardTitle className="text-2xl">Booking History</CardTitle>
          <p className="text-muted-foreground mt-1">
            {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}{" "}
            found
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No bookings found</p>
            <Button
              className="mt-4"
              onClick={() => (window.location.href = "/")}
            >
              Book a Movie
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">
                    <button
                      onClick={() => sortBookings("movieTitle")}
                      className="flex items-center text-left"
                    >
                      <Film className="h-4 w-4 mr-2" />
                      Movie
                      {renderSortIcon("movieTitle")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 font-medium">
                    <button
                      onClick={() => sortBookings("date")}
                      className="flex items-center text-left"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Date
                      {renderSortIcon("date")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 font-medium">
                    <button className="flex items-center text-left">
                      <Clock className="h-4 w-4 mr-2" />
                      Showtime
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 font-medium">
                    <button className="flex items-center text-left">
                      <MapPin className="h-4 w-4 mr-2" />
                      Theater
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 font-medium">
                    <button
                      onClick={() => sortBookings("amount")}
                      className="flex items-center text-left"
                    >
                      Amount
                      {renderSortIcon("amount")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 font-medium">Seats</th>
                </tr>
              </thead>
              <tbody>
                {getSortedBookings().map((booking) => {
                  return (
                    <tr
                      key={booking.paymentId}
                      className="border-b hover:bg-muted transition-colors"
                    >
                      <td className="py-4 px-2 font-medium">
                        {booking.movieTitle}
                      </td>
                      <td className="py-4 px-2">{formatDate(booking.date)}</td>
                      <td className="py-4 px-2">
                        {formatTime(booking.showtime)}
                      </td>
                      <td className="py-4 px-2">
                        {theaterName[parseInt(booking.theater[1]) - 1]}
                      </td>
                      <td className="py-4 px-2">₹{booking.amount}</td>
                      <td className="py-4 px-2">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(booking.seats) ? (
                            booking.seats.map((seat, index) => (
                              <span
                                key={index}
                                className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md"
                              >
                                {seat}
                              </span>
                            ))
                          ) : (
                            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">
                              {booking.seats}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
