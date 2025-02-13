import { doc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

export async function querySeat(docId: string, seatIndex: number) {
  try {
    // Reference to the specific document
    const docRef = doc(db, "movieSchedules", docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      const seatData = data?.seats[seatIndex]
      console.log(seatData)
      //   if (seatData) {
      //     console.log(`Seat ${seatId} state:`, seatData.state);
      //     return seatData;
      //   } else {
      //     console.log(`Seat ${seatId} not found`);
      //     return null;
      //   }
    } else {
      console.log("No such document!")
      return null
    }
  } catch (error) {
    console.error("Error querying seat data:", error)
  }
}
