import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore"
import { getWeekDetails } from "./getWeekDetails"
import { db } from "./firebase"
import { Movie, Seat } from "@/types"
import { getMovies } from "@/apis/getMovies"

async function getFirestoreMovieIds() {
  try {
    const moviesRef = collection(db, "movieSchedules")

    // Get all documents
    const snapshot = await getDocs(moviesRef)

    // Create a Set to store unique movie IDs
    const movieIds = new Set<string>()

    // Extract movie IDs from each document
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.movieId) {
        movieIds.add(data.movieId)
      }
    })

    // Convert Set to Array
    return Array.from(movieIds)
  } catch (error) {
    console.error("Error getting movie IDs:", error)
    throw error
  }
}

export function generateTheatersData() {
  return [
    {
      id: "T1",
      name: "Fun Cinemas",
      showTimes: ["10:00", "13:00", "16:00", "19:00", "22:00"],
    },
    {
      id: "T2",
      name: "PVR Cinemas",
      showTimes: ["11:00", "14:00", "18:00", "21:00"],
    },
    {
      id: "T3",
      name: "Cinepolis",
      showTimes: ["9:00", "12:00", "15:00", "18:00", "21:00"],
    },
    {
      id: "T4",
      name: "Inox Movies",
      showTimes: ["12:00", "16:00", "19:00", "23:00"],
    },
  ]
}

function generateSeatsData() {
  const seats: Seat[] = []
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"]
  rows.forEach((row) => {
    for (let i = 1; i <= 12; i++) {
      seats.push({
        status: "available",
        userId: null,
        id: `${row}${i}`,
        row,
        number: i,
      })
    }
  })
  return seats
}

async function deleteUnlistedMovies(movies: Movie[]) {
  try {
    const movieIdsArray = movies.map((movie) => movie.id.toString())
    const movieSchedulesRef = collection(db, "movieSchedules")

    const querySnapshot = await getDocs(movieSchedulesRef)

    let deletedCount = 0

    const deletePromises = querySnapshot.docs
      .filter((doc) => {
        const documentName = doc.id
        const movieId = documentName.split("_")[0]
        return !movieIdsArray.includes(movieId)
      })
      .map(async (doc) => {
        await deleteDoc(doc.ref)
        deletedCount++
      })

    await Promise.all(deletePromises)

    console.log(`Successfully deleted ${deletedCount} movie schedules`)
    return deletedCount
  } catch (error) {
    console.error("Error deleting movie schedules:", error)
    throw error
  }
}

export async function generateMovieData() {
  try {
    const moviesData = await getMovies()
    const movies = moviesData.results
    console.log("getMovies: ", movies)
    const theaters = generateTheatersData()
    const weekDates = getWeekDetails()
    const seats = generateSeatsData()
    const getMoviesId = await getFirestoreMovieIds()

    let batch = writeBatch(db)
    let operationCount = 0
    const MAX_BATCH_SIZE = 500

    for (const movie of movies) {
      if (getMoviesId.includes(movie.id)) {
        const dateString = `${weekDates[weekDates.length - 1].date}${
          weekDates[weekDates.length - 1].month
        }`
        for (const theater of theaters) {
          for (const showTime of theater.showTimes) {
            const docId = `${movie.id}_${dateString}_${
              theater.id
            }_${showTime.replace(":", "")}`

            const showTimeData = {
              movieId: movie.id,
              movieTitle: movie.title,
              posterPath: movie.poster_path,
              date: weekDates[weekDates.length - 1].date,
              month: weekDates[weekDates.length - 1].month,
              day: weekDates[weekDates.length - 1].day,
              theaterId: theater.id,
              theaterName: theater.name,
              showTime: showTime,
              seats: seats,
              totalSeats: seats?.length,
              availableSeats: seats?.length,
              createdAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
            }

            batch.set(doc(db, "movieSchedules", docId), showTimeData)
            operationCount++

            // If we reach the batch limit, commit and create a new batch
            if (operationCount >= MAX_BATCH_SIZE) {
              await batch.commit()
              console.log(`Committed batch of ${operationCount} operations`)
              operationCount = 0
              // Create a new batch
              batch = writeBatch(db)
            }
            // await setDoc(doc(db, "movieSchedules", docId), showTimeData)
          }
          if (operationCount > 0) {
            await batch.commit()
            console.log(`Committed final batch of ${operationCount} operations`)
          }
        }
      } else {
        for (const dateInfo of weekDates) {
          const dateString = `${dateInfo.date}${dateInfo.month}`

          for (const theater of theaters) {
            for (const showTime of theater.showTimes) {
              const docId = `${movie.id}_${dateString}_${
                theater.id
              }_${showTime.replace(":", "")}`

              const showTimeData = {
                movieId: movie.id,
                movieTitle: movie.title,
                posterPath: movie.poster_path,
                date: dateInfo.date,
                month: dateInfo.month,
                day: dateInfo.day,
                theaterId: theater.id,
                theaterName: theater.name,
                showTime: showTime,
                seats: seats,
                totalSeats: seats?.length,
                availableSeats: seats?.length,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              }

              await setDoc(doc(db, "movieSchedules", docId), showTimeData)
            }
          }
        }
      }
    }

    deleteUnlistedMovies(movies)

    console.log("Successfully saved all movie schedules")
  } catch (error) {
    console.error("Error saving movie schedules:", error)
    throw error
  }
}

export async function dailyTaskUpdates() {
  const currentDate = new Date().toLocaleDateString()
  const dailyUpdateRef = doc(db, "dailyTasks", "executionDate")

  try {
    const docSnap = await getDoc(dailyUpdateRef)
    if (docSnap.exists()) {
      const lastExecutionDate = docSnap.data().date

      if (lastExecutionDate !== currentDate) {
        console.log("Executing daily task...")

        await generateMovieData()

        await setDoc(dailyUpdateRef, { date: currentDate })
      }
    } else {
      console.log("First-time execution. Executing daily task...")
      await generateMovieData()

      await setDoc(dailyUpdateRef, { date: currentDate })
    }
  } catch (error) {
    console.error("Error checking or updating daily task:", error)
  }
}
