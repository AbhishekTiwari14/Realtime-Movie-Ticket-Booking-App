import { doc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

export async function querySeat(docId: string, seatIndex: number) {
  try {
    const docRef = doc(db, "movieSchedules", docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      const seatData = data?.seats[seatIndex]
      console.log(seatData)
    } else {
      console.log("No such document!")
      return null
    }
  } catch (error) {
    console.error("Error querying seat data:", error)
  }
}
