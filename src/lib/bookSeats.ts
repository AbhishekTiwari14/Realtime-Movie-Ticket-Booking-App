import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "./firebase"
import { Seat } from "@/types"

export async function bookSeats(
  docId: string,
  selectedSeats: string[],
  seatStatus: string
) {
  const docRef = doc(db, "movieSchedules", docId)

  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    const currentSeats = docSnap.data().seats

    const updatedSeats = currentSeats.map((seat: Seat) =>
      selectedSeats.includes(seat.id)
        ? {
            ...seat,
            status: seatStatus,
            selectionTimestamp:
              seatStatus === "selected"
                ? new Date().toISOString()
                : seat.selectionTimestamp,
          }
        : seat
    )

    await updateDoc(docRef, {
      seats: updatedSeats,
    })
  }
}


