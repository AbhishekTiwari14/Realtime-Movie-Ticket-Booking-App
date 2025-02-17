import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function getMovieDetailsFromDocId(docId: string) {
  const movieRef = doc(db, "movieSchedules", docId)
  const snapshot = await getDoc(movieRef)
  console.log(snapshot.data)
}
