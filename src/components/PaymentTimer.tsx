import React, { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { bookSeats } from "@/lib/bookSeats"
import { useNavigate } from "react-router-dom"
import { Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Seat } from "@/types"
import toast from "react-hot-toast"

interface PaymentTimerProps {
  docId: string
  seats: string[]
}

const PaymentTimer: React.FC<PaymentTimerProps> = ({ docId, seats }) => {
  const [timeLeft, setTimeLeft] = useState<number>(5 * 60) 
  const [isExpiring, setIsExpiring] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    const calculateRemainingTime = async () => {
      if (!docId || !seats || seats.length === 0) return

      try {
        const docRef = doc(db, "movieSchedules", docId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const seatData = docSnap.data().seats
          const selectedSeatObjects = seatData.filter(
            (seat: Seat) =>
              seats.includes(seat.id) && seat.status === "selected"
          )

          let earliestTimestamp: Date | null = null

          selectedSeatObjects.forEach((seat: Seat) => {
            if (seat.selectionTimestamp) {
              const timestamp = new Date(seat.selectionTimestamp)
              if (!earliestTimestamp || timestamp < earliestTimestamp) {
                earliestTimestamp = timestamp
              }
            }
          })

          if (earliestTimestamp) {
            const timestamp = earliestTimestamp as Date
            const endTime = new Date(timestamp.getTime() + 5 * 60 * 1000)
            const now = new Date()
            const remainingMs = endTime.getTime() - now.getTime()

            if (remainingMs > 0) {
              setTimeLeft(Math.floor(remainingMs / 1000))
            } else {
              handleTimerExpired()
            }
          }
        }
      } catch (error) {
        console.error("Error calculating timer:", error)
      }
    }

    calculateRemainingTime()

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 60 && prevTime > 30) {
          setIsExpiring(true)
        }

        if (prevTime <= 1) {
          clearInterval(timerInterval)
          handleTimerExpired()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timerInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId, seats, navigate])

  const handleTimerExpired = async () => {
    try {
      if (docId && seats && seats.length > 0) {
        await bookSeats(docId, seats, "available")
      }

      toast.error(`Payment Filed: Timed Out`)
      const timeout = setTimeout(() => {
        navigate(`/`)
      }, 1000)

      return () => clearTimeout(timeout)
    } catch (error) {
      console.error("Error releasing seats on timeout:", error)
      navigate("/")
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  return (
    <div className="mb-6">
      {isExpiring ? (
        <Alert variant="destructive" className="mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-secondary-foreground" />{" "}
            <AlertDescription className="mt-0 leading-5">
              Complete payment in{" "}
              <span className="font-bold">{formatTime(timeLeft)}</span>
            </AlertDescription>
          </div>
        </Alert>
      ) : (
        <Alert variant="default" className="mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-secondary-foreground" />{" "}
            <AlertDescription className="mt-0 leading-5">
              Complete payment in{" "}
              <span className="font-bold">{formatTime(timeLeft)}</span>
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  )
}

export default PaymentTimer
