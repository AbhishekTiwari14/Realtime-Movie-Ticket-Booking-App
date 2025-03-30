import {
  collection,
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

// Cache for movie IDs to reduce reads
let movieIdsCache: string[] | null = null
let movieIdsCacheExpiry: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Define interface for batch operation
interface BatchOperation {
  docId: string
  data: {
    movieId: string | number
    movieTitle: string
    posterPath: string
    date: string | number
    month: string | number
    day: string
    theaterId: string
    theaterName: string
    showTime: string
    seats: Seat[]
    totalSeats: number
    availableSeats: number
    createdAt: string
    lastUpdated: string
  }
}

async function getFirestoreMovieIds() {
  // Check cache first
  if (
    movieIdsCache &&
    movieIdsCacheExpiry &&
    Date.now() < movieIdsCacheExpiry
  ) {
    return movieIdsCache
  }

  try {
    const moviesRef = collection(db, "movieSchedules")
    const snapshot = await getDocs(moviesRef)
    const movieIds = new Set<string>()

    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.movieId) {
        movieIds.add(data.movieId)
      }
    })

    // Update cache
    movieIdsCache = Array.from(movieIds)
    movieIdsCacheExpiry = Date.now() + CACHE_DURATION

    return movieIdsCache
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
      showTimes: ["10:00", "13:00", "16:00", "19:00"],
    },
    {
      id: "T2",
      name: "PVR Cinemas",
      showTimes: ["11:00", "14:00", "18:00", "21:00"],
    },
    {
      id: "T3",
      name: "Cinepolis",
      showTimes: ["9:00", "12:00", "15:00", "18:00"],
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

    const docsToDelete = querySnapshot.docs.filter((doc) => {
      const documentName = doc.id
      const movieId = documentName.split("_")[0]
      return !movieIdsArray.includes(movieId)
    })

    // Smaller batch size for deletions
    const DELETION_BATCH_SIZE = 4
    // Longer delay between deletion batches
    const DELETION_DELAY = 10000 // 10 seconds

    // Process deletions in smaller batches with longer delays
    for (let i = 0; i < docsToDelete.length; i += DELETION_BATCH_SIZE) {
      const batch = writeBatch(db)
      const batchDocs = docsToDelete.slice(i, i + DELETION_BATCH_SIZE)

      batchDocs.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      console.log(
        `Deleted batch ${
          Math.floor(i / DELETION_BATCH_SIZE) + 1
        } of ${Math.ceil(docsToDelete.length / DELETION_BATCH_SIZE)}`
      )
      await sleep(DELETION_DELAY)
    }

    console.log(`Successfully deleted ${docsToDelete.length} movie schedules`)
    return docsToDelete.length
  } catch (error) {
    console.error("Error deleting movie schedules:", error)
    throw error
  }
}

async function processMovieScheduleBatch(
  batch: BatchOperation[],
  retryCount = 0
): Promise<void> {
  const MAX_RETRIES = 3
  const RETRY_DELAY = Math.pow(2, retryCount) * 1000 // Exponential backoff

  try {
    const writeBatchObj = writeBatch(db)

    batch.forEach(({ docId, data }) => {
      const docRef = doc(db, "movieSchedules", docId)
      writeBatchObj.set(docRef, data)
    })

    await writeBatchObj.commit()
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying batch operation. Attempt ${retryCount + 1}`)
      await sleep(RETRY_DELAY)
      return processMovieScheduleBatch(batch, retryCount + 1)
    }
    throw error
  }
}

export async function generateMovieData() {
  try {
    const moviesData = await getMovies()
    const movies = moviesData.results
    const theaters = generateTheatersData()
    const week = getWeekDetails()
    const weekDates = week.slice(0, 2)
    const seats = generateSeatsData()
    const getMoviesId = await getFirestoreMovieIds()

    // Process movies in smaller chunks with significant delays
    const MOVIES_PER_CHUNK = 2
    const CHUNK_DELAY = 2 * 60 * 1000 // 2 minutes in milliseconds

    // Process movies in smaller chunks
    for (
      let movieIndex = 0;
      movieIndex < movies.length;
      movieIndex += MOVIES_PER_CHUNK
    ) {
      const movieChunk = movies.slice(movieIndex, movieIndex + MOVIES_PER_CHUNK)
      console.log(
        `Processing movie chunk ${
          Math.floor(movieIndex / MOVIES_PER_CHUNK) + 1
        } of ${Math.ceil(movies.length / MOVIES_PER_CHUNK)}`
      )

      const batchOperations: BatchOperation[] = []

      // Process each movie in the current chunk
      for (const movie of movieChunk) {
        if (getMoviesId.includes(movie.id)) {
          const dateInfo = weekDates[weekDates.length - 1]
          const dateString = `${dateInfo.date}${dateInfo.month}`

          for (const theater of theaters) {
            for (const showTime of theater.showTimes) {
              const docId = `${movie.id}_${dateString}_${
                theater.id
              }_${showTime.replace(":", "")}`

              batchOperations.push({
                docId,
                data: {
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
                },
              })
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

                batchOperations.push({
                  docId,
                  data: {
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
                  },
                })
              }
            }
          }
        }
      }

      // Process batch operations with increased delays
      const INCREASED_BATCH_SIZE = 5 // Smaller batch size
      const INCREASED_OPERATION_DELAY = 10000 // 10 seconds delay between batches

      // Process in smaller batches with longer delays
      for (let i = 0; i < batchOperations.length; i += INCREASED_BATCH_SIZE) {
        const batch = batchOperations.slice(i, i + INCREASED_BATCH_SIZE)
        await processMovieScheduleBatch(batch)
        console.log(
          `Completed batch ${
            Math.floor(i / INCREASED_BATCH_SIZE) + 1
          } of ${Math.ceil(batchOperations.length / INCREASED_BATCH_SIZE)}`
        )
        await sleep(INCREASED_OPERATION_DELAY) // Longer delay between batches
      }

      // Add a 5-minute delay after processing each chunk of movies (except the last chunk)
      if (movieIndex + MOVIES_PER_CHUNK < movies.length) {
        console.log(`Pausing for 2 minutes to avoid quota limits...`)
        await sleep(CHUNK_DELAY)
      }
    }

    // Only delete movies after all processing is complete
    await deleteUnlistedMovies(movies)
    console.log("Successfully saved all movie schedules")
  } catch (error) {
    console.error("Error saving movie schedules:", error)
    throw error
  }
}
// Debounce mechanism
let updateTimeout: NodeJS.Timeout | null = null
const DEBOUNCE_DELAY = 5000 // 5 seconds

export async function dailyTaskUpdates() {
  // Clear any pending update
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }

  // Debounce the update
  updateTimeout = setTimeout(async () => {
    const currentDate = new Date().toLocaleDateString()
    const dailyUpdateRef = doc(db, "dailyTasks", "executionDate")

    try {
      const docSnap = await getDoc(dailyUpdateRef)

      if (!docSnap.exists() || docSnap.data().date !== currentDate) {
        console.log("Executing daily task...")
        await generateMovieData()
        await setDoc(dailyUpdateRef, { date: currentDate })
      } else {
        console.log("Daily task already executed today.")
      }
    } catch (error) {
      console.error("Error checking or updating daily task:", error)
    }
  }, DEBOUNCE_DELAY)
}
