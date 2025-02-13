import { Seat, SeatContextType } from "@/types"
import { createContext, ReactNode } from "react"
import { collection, getDocs, getFirestore } from "firebase/firestore"

const SeatContext = createContext<SeatContextType | null>(null)

export const SeatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const db = getFirestore()

  async function getAllSeats(
    movieId: string,
    theaterId: string,
    showtimeId: string
  ): Promise<Seat[]> {
    try {
      const seatsCollection = collection(
        db,
        "seats",
        movieId,
        "theaters",
        theaterId,
        "showtimes",
        showtimeId,
        "seats"
      )
      const seatDocs = await getDocs(seatsCollection)
      const seats: Seat[] = seatDocs.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Seat, "id">),
      }))
      return seats
    } catch (error) {
      console.error("Error fetching seats:", error)
      return []
    }
  }

  const value = {
    getAllSeats,
  }
  return <SeatContext.Provider value={value}>{children}</SeatContext.Provider>
}
