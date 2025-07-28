import { doc, getDoc } from "firebase/firestore"
import { db } from "./firebase"
import { Seat } from "@/types"
import { bookSeats } from "./bookSeats"

export function startSeatReleaseTimeout(docId: string, selectedSeats: string[]) {
    setTimeout(async () => {
      try {
        const docRef = doc(db, "movieSchedules", docId)
        const docSnap = await getDoc(docRef)
  
        if (docSnap.exists()) {
          const currentSeats = docSnap.data().seats
          const now = new Date()
  
          const seatsToRelease = currentSeats.filter((seat: Seat) => {
            if (!selectedSeats.includes(seat.id)) return false
            if (seat.status !== "selected") return false
  
            if (!seat.selectionTimestamp) return false
            const selectionTime = new Date(seat.selectionTimestamp)
            const timeDiffMs = now.getTime() - selectionTime.getTime()
            const fiveMinutesMs = 5 * 60 * 1000
  
            return timeDiffMs >= fiveMinutesMs
          })
  
          if (seatsToRelease.length > 0) {
            const seatsToReleaseIds = seatsToRelease.map((seat: Seat) => seat.id)
            await bookSeats(docId, seatsToReleaseIds, "available")
          }
        }
      } catch (error) {
        console.error("Error in seat release timeout:", error)
      }
    }, 5 * 60 * 1000) 
  }