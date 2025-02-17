import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore"
import { getWeekDetails } from "./getWeekDetails"
import { db } from "./firebase"
import { Seat } from "@/types"
import { format, subDays } from "date-fns"

async function getMoviesData() {
  const response = await fetch(
    "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1&region=IN"
  )
  const data = await response.json()
  console.log("Asx", data.results)
  return data.results
}

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

async function deleteYesterdayMovieSchedules() {
  try {
    // Get yesterday's date
    const yesterday = subDays(new Date(), 1)
    const yesterdayDate = format(yesterday, "d") // Gets day of month as 1-31
    const yesterdayMonth = format(yesterday, "M") // Gets month as 1-12

    // Reference to movieSchedules collection
    const movieSchedulesRef = collection(db, "movieSchedules")

    // Create a query to find all documents for yesterday
    const q = query(
      movieSchedulesRef,
      where("date", "==", yesterdayDate),
      where("month", "==", yesterdayMonth)
    )

    // Get all matching documents
    const querySnapshot = await getDocs(q)

    // Keep track of deleted documents count
    let deletedCount = 0

    // Delete each document
    const deletePromises = querySnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref)
      deletedCount++
    })

    // Wait for all deletions to complete
    await Promise.all(deletePromises)

    console.log(
      `Successfully deleted ${deletedCount} movie schedules from yesterday`
    )
    return deletedCount
  } catch (error) {
    console.error("Error deleting yesterday's movie schedules:", error)
    throw error
  }
}

export async function generateMovieData() {
  try {
    const movies = await getMoviesData()
    const theaters = generateTheatersData()
    const weekDates = getWeekDetails()
    const seats = generateSeatsData()
    const getMoviesId = await getFirestoreMovieIds()

    for (const movie of movies) {
      if (getMoviesId.includes(movie.id)) {
        const dateString = `${weekDates[weekDates.length - 1].date}${
          weekDates[weekDates.length - 1].month
        }`
        for (const theater of theaters) {
          for (const showTime of theater.showTimes) {
            // Create a unique document ID for each showtime
            const docId = `${movie.id}_${dateString}_${
              theater.id
            }_${showTime.replace(":", "")}`

            // Create the document data
            const showTimeData = {
              movieId: movie.id,
              movieTitle: movie.title,
              posterPath: movie.poster_path,
              // Date info
              date: weekDates[weekDates.length - 1].date,
              month: weekDates[weekDates.length - 1].month,
              day: weekDates[weekDates.length - 1].day,
              // Theater info
              theaterId: theater.id,
              theaterName: theater.name,
              showTime: showTime,
              // Seats
              seats: seats,
              // Metadata
              totalSeats: seats?.length,
              availableSeats: seats?.length,
              createdAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
            }

            // Save to Firestore
            await setDoc(doc(db, "movieSchedules", docId), showTimeData)
          }
        }
      } else {
        for (const dateInfo of weekDates) {
          // Create a formatted date string for the document ID
          const dateString = `${dateInfo.date}${dateInfo.month}`

          for (const theater of theaters) {
            for (const showTime of theater.showTimes) {
              // Create a unique document ID for each showtime
              const docId = `${movie.id}_${dateString}_${
                theater.id
              }_${showTime.replace(":", "")}`

              // Create the document data
              const showTimeData = {
                movieId: movie.id,
                movieTitle: movie.title,
                posterPath: movie.poster_path,
                // Date info
                date: dateInfo.date,
                month: dateInfo.month,
                day: dateInfo.day,
                // Theater info
                theaterId: theater.id,
                theaterName: theater.name,
                showTime: showTime,
                // Seats
                seats: seats,
                // Metadata
                totalSeats: seats?.length,
                availableSeats: seats?.length,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              }

              // Save to Firestore
              await setDoc(doc(db, "movieSchedules", docId), showTimeData)
            }
          }
        }
      }
    }

    deleteYesterdayMovieSchedules()

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
      // If no date exists, it's the first run, so execute the task
      console.log("First-time execution. Executing daily task...")
      await generateMovieData()

      // Save today's date to Firestore
      await setDoc(dailyUpdateRef, { date: currentDate })
    }
  } catch (error) {
    console.error("Error checking or updating daily task:", error)
  }
}
