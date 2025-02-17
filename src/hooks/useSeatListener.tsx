import { db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"


export function useSeatListener(docId: string){
    const listenToSeatUpdates = () => {
        const docRef = doc(db, "movieSchedules", docId)
    
        // Real-time listener
        return onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            setSeats(doc.data().seats)
          } else {
            console.log("No seat data found")
          }
    })
}