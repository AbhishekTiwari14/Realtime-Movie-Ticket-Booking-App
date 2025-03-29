// import {
//   collection,
//   doc,
//   getDoc,
//   getDocs,
//   setDoc,
//   writeBatch,
// } from "firebase/firestore"
// import { getWeekDetails } from "./getWeekDetails"
// import { db } from "./firebase"
// import { Movie, Seat } from "@/types"
// import { getMovies } from "@/apis/getMovies"

// // Cache for movie IDs to reduce reads
// let movieIdsCache: string[] | null = null
// let movieIdsCacheExpiry: number | null = null
// const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// // Throttling configuration
// const BATCH_SIZE = 100 // Firestore batch limit is 500
// const OPERATION_DELAY = 3000 // 1 second delay between batches

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// // Define interface for batch operation
// interface BatchOperation {
//   docId: string
//   data: {
//     movieId: string | number
//     movieTitle: string
//     posterPath: string
//     date: string | number
//     month: string | number
//     day: string
//     theaterId: string
//     theaterName: string
//     showTime: string
//     seats: Seat[]
//     totalSeats: number
//     availableSeats: number
//     createdAt: string
//     lastUpdated: string
//   }
// }

// async function getFirestoreMovieIds() {
//   // Check cache first
//   if (
//     movieIdsCache &&
//     movieIdsCacheExpiry &&
//     Date.now() < movieIdsCacheExpiry
//   ) {
//     return movieIdsCache
//   }

//   try {
//     const moviesRef = collection(db, "movieSchedules")
//     const snapshot = await getDocs(moviesRef)
//     const movieIds = new Set<string>()

//     snapshot.forEach((doc) => {
//       const data = doc.data()
//       if (data.movieId) {
//         movieIds.add(data.movieId)
//       }
//     })

//     // Update cache
//     movieIdsCache = Array.from(movieIds)
//     movieIdsCacheExpiry = Date.now() + CACHE_DURATION

//     return movieIdsCache
//   } catch (error) {
//     console.error("Error getting movie IDs:", error)
//     throw error
//   }
// }

// export function generateTheatersData() {
//   return [
//     {
//       id: "T1",
//       name: "Fun Cinemas",
//       showTimes: ["10:00", "13:00", "16:00", "19:00", "22:00"],
//     },
//     {
//       id: "T2",
//       name: "PVR Cinemas",
//       showTimes: ["11:00", "14:00", "18:00", "21:00"],
//     },
//     {
//       id: "T3",
//       name: "Cinepolis",
//       showTimes: ["9:00", "12:00", "15:00", "18:00", "21:00"],
//     },
//     {
//       id: "T4",
//       name: "Inox Movies",
//       showTimes: ["12:00", "16:00", "19:00", "23:00"],
//     },
//   ]
// }

// function generateSeatsData() {
//   const seats: Seat[] = []
//   const rows = ["A", "B", "C", "D", "E", "F", "G", "H"]
//   rows.forEach((row) => {
//     for (let i = 1; i <= 12; i++) {
//       seats.push({
//         status: "available",
//         userId: null,
//         id: `${row}${i}`,
//         row,
//         number: i,
//       })
//     }
//   })
//   return seats
// }

// async function deleteUnlistedMovies(movies: Movie[]) {
//   try {
//     const movieIdsArray = movies.map((movie) => movie.id.toString())
//     const movieSchedulesRef = collection(db, "movieSchedules")
//     const querySnapshot = await getDocs(movieSchedulesRef)

//     const docsToDelete = querySnapshot.docs.filter((doc) => {
//       const documentName = doc.id
//       const movieId = documentName.split("_")[0]
//       return !movieIdsArray.includes(movieId)
//     })

//     // Process deletions in batches
//     for (let i = 0; i < docsToDelete.length; i += BATCH_SIZE) {
//       const batch = writeBatch(db)
//       const batchDocs = docsToDelete.slice(i, i + BATCH_SIZE)

//       batchDocs.forEach((doc) => {
//         batch.delete(doc.ref)
//       })

//       await batch.commit()
//       await sleep(OPERATION_DELAY)
//     }

//     console.log(`Successfully deleted ${docsToDelete.length} movie schedules`)
//     return docsToDelete.length
//   } catch (error) {
//     console.error("Error deleting movie schedules:", error)
//     throw error
//   }
// }

// async function processMovieScheduleBatch(
//   batch: BatchOperation[],
//   retryCount = 0
// ): Promise<void> {
//   const MAX_RETRIES = 3
//   const RETRY_DELAY = Math.pow(2, retryCount) * 1000 // Exponential backoff

//   try {
//     const writeBatchObj = writeBatch(db)

//     batch.forEach(({ docId, data }) => {
//       const docRef = doc(db, "movieSchedules", docId)
//       writeBatchObj.set(docRef, data)
//     })

//     await writeBatchObj.commit()
//   } catch (error) {
//     if (retryCount < MAX_RETRIES) {
//       console.log(`Retrying batch operation. Attempt ${retryCount + 1}`)
//       await sleep(RETRY_DELAY)
//       return processMovieScheduleBatch(batch, retryCount + 1)
//     }
//     throw error
//   }
// }

// export async function generateMovieData() {
//   try {
//     const moviesData = await getMovies()
//     const movies = moviesData.results
//     const theaters = generateTheatersData()
//     const weekDates = getWeekDetails()
//     const seats = generateSeatsData()
//     const getMoviesId = await getFirestoreMovieIds()

//     const batchOperations: BatchOperation[] = []

//     for (const movie of movies) {
//       if (getMoviesId.includes(movie.id)) {
//         const dateInfo = weekDates[weekDates.length - 1]
//         const dateString = `${dateInfo.date}${dateInfo.month}`

//         for (const theater of theaters) {
//           for (const showTime of theater.showTimes) {
//             const docId = `${movie.id}_${dateString}_${
//               theater.id
//             }_${showTime.replace(":", "")}`

//             batchOperations.push({
//               docId,
//               data: {
//                 movieId: movie.id,
//                 movieTitle: movie.title,
//                 posterPath: movie.poster_path,
//                 date: dateInfo.date,
//                 month: dateInfo.month,
//                 day: dateInfo.day,
//                 theaterId: theater.id,
//                 theaterName: theater.name,
//                 showTime: showTime,
//                 seats: seats,
//                 totalSeats: seats?.length,
//                 availableSeats: seats?.length,
//                 createdAt: new Date().toISOString(),
//                 lastUpdated: new Date().toISOString(),
//               },
//             })
//           }
//         }
//       } else {
//         for (const dateInfo of weekDates) {
//           const dateString = `${dateInfo.date}${dateInfo.month}`

//           for (const theater of theaters) {
//             for (const showTime of theater.showTimes) {
//               const docId = `${movie.id}_${dateString}_${
//                 theater.id
//               }_${showTime.replace(":", "")}`

//               batchOperations.push({
//                 docId,
//                 data: {
//                   movieId: movie.id,
//                   movieTitle: movie.title,
//                   posterPath: movie.poster_path,
//                   date: dateInfo.date,
//                   month: dateInfo.month,
//                   day: dateInfo.day,
//                   theaterId: theater.id,
//                   theaterName: theater.name,
//                   showTime: showTime,
//                   seats: seats,
//                   totalSeats: seats?.length,
//                   availableSeats: seats?.length,
//                   createdAt: new Date().toISOString(),
//                   lastUpdated: new Date().toISOString(),
//                 },
//               })
//             }
//           }
//         }
//       }

//       // Process in batches of 500
//       for (let i = 0; i < batchOperations.length; i += BATCH_SIZE) {
//         const batch = batchOperations.slice(i, i + BATCH_SIZE)
//         await processMovieScheduleBatch(batch)
//         await sleep(OPERATION_DELAY) // Delay between batches
//       }
//     }

//     await deleteUnlistedMovies(movies)
//     console.log("Successfully saved all movie schedules")
//   } catch (error) {
//     console.error("Error saving movie schedules:", error)
//     throw error
//   }
// }

// // Debounce mechanism
// let updateTimeout: NodeJS.Timeout | null = null
// const DEBOUNCE_DELAY = 5000 // 5 seconds

// export async function dailyTaskUpdates() {
//   // Clear any pending update
//   if (updateTimeout) {
//     clearTimeout(updateTimeout)
//   }

//   // Debounce the update
//   updateTimeout = setTimeout(async () => {
//     const currentDate = new Date().toLocaleDateString()
//     const dailyUpdateRef = doc(db, "dailyTasks", "executionDate")

//     try {
//       const docSnap = await getDoc(dailyUpdateRef)

//       if (!docSnap.exists() || docSnap.data().date !== currentDate) {
//         console.log("Executing daily task...")
//         await generateMovieData()
//         await setDoc(dailyUpdateRef, { date: currentDate })
//       } else {
//         console.log("Daily task already executed today.")
//       }
//     } catch (error) {
//       console.error("Error checking or updating daily task:", error)
//     }
//   }, DEBOUNCE_DELAY)
// }

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore"
import { ref, set, onValue, remove } from "firebase/database"
import { getDatabase } from "firebase/database"
import { getWeekDetails } from "./getWeekDetails"
import { db } from "./firebase"
import { Movie, Seat } from "@/types"
import { getMovies } from "@/apis/getMovies"

// Cache for movie IDs to reduce reads
let movieIdsCache: string[] | null = null
let movieIdsCacheExpiry: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Initialize the database for queue system
const database = getDatabase()

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
        movieIds.add(String(data.movieId))
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

    const docsToDelete = querySnapshot.docs.filter((doc) => {
      const documentName = doc.id
      const movieId = documentName.split("_")[0]
      return !movieIdsArray.includes(movieId)
    })

    console.log(`Found ${docsToDelete.length} movie schedules to delete`)

    // Process deletions in smaller batches with longer delays
    for (let i = 0; i < docsToDelete.length; i += 20) {
      const batch = writeBatch(db)
      const batchDocs = docsToDelete.slice(i, i + 20)

      batchDocs.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      console.log(
        `Deleted batch ${Math.floor(i / 20) + 1}/${Math.ceil(
          docsToDelete.length / 20
        )}`
      )
      await sleep(8000) // Longer delay for deletions
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
  const MAX_RETRIES = 5 // Increased from 3
  const RETRY_DELAY = Math.pow(2, retryCount) * 2000 // Increased base delay

  try {
    const writeBatchObj = writeBatch(db)

    batch.forEach(({ docId, data }) => {
      const docRef = doc(db, "movieSchedules", docId)
      writeBatchObj.set(docRef, data)
    })

    await writeBatchObj.commit()
    console.log(`Successfully committed batch of ${batch.length} operations`)
  } catch (error) {
    console.error(`Batch operation failed:`, error)

    if (retryCount < MAX_RETRIES) {
      console.log(
        `Retrying batch operation. Attempt ${retryCount + 1}/${MAX_RETRIES}`
      )
      await sleep(RETRY_DELAY)
      return processMovieScheduleBatch(batch, retryCount + 1)
    }

    console.error(
      `Max retries (${MAX_RETRIES}) reached for batch operation. Giving up.`
    )
    throw error
  }
}

// Queue system for movie data generation
class MovieDataQueue {
  private queueRef
  private processing = false

  constructor() {
    this.queueRef = ref(database, "movieDataQueue")
  }

  // Initialize the queue listener
  public initialize() {
    onValue(this.queueRef, async (snapshot) => {
      if (this.processing) return

      const queue = snapshot.val() || {}
      const items = Object.entries(queue)

      if (items.length > 0) {
        this.processing = true
        try {
          // Process the first item in the queue
          const [key, movie] = items[0]
          await this.processMovie(movie as Movie)

          // Remove the processed item
          await remove(ref(database, `movieDataQueue/${key}`))
        } catch (error) {
          console.error("Error processing movie from queue:", error)
        } finally {
          this.processing = false
        }
      }
    })
  }

  // Add a movie to the queue
  public async addToQueue(movie: Movie) {
    const newItemRef = ref(database, `movieDataQueue/${Date.now()}`)
    await set(newItemRef, movie)
  }

  // Process a single movie
  private async processMovie(movie: Movie) {
    const theaters = generateTheatersData()
    const weekDates = getWeekDetails()
    const seats = generateSeatsData()
    const existingMovieIds = await getFirestoreMovieIds()

    const batchOperations: BatchOperation[] = []

    // Create operations for this movie
    if (existingMovieIds.includes(String(movie.id))) {
      // For existing movies, only update the last date
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
      // For new movies, create entries for all dates
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

    // Process in smaller batches with longer delays
    for (let i = 0; i < batchOperations.length; i += 20) {
      const batch = batchOperations.slice(i, i + 20)
      await processMovieScheduleBatch(batch)
      console.log(
        `Processed batch ${Math.floor(i / 20) + 1}/${Math.ceil(
          batchOperations.length / 20
        )} for movie ${movie.title}`
      )

      // Dynamic delay based on remaining operations
      const remainingBatches = Math.ceil((batchOperations.length - i - 20) / 20)
      const delay = Math.min(6000 + (remainingBatches > 5 ? 4000 : 0), 15000)
      await sleep(delay)
    }
  }
}

export async function generateMovieData() {
  try {
    const moviesData = await getMovies()
    const movies = moviesData.results
    const queue = new MovieDataQueue()

    // Initialize the queue processor
    queue.initialize()

    // Add movies to the queue instead of processing them directly
    for (const movie of movies) {
      await queue.addToQueue(movie)
      await sleep(1000) // Small delay between adding to queue
    }

    // Still run the cleanup function but only after a delay
    // to prevent overwhelming Firestore
    setTimeout(async () => {
      try {
        await deleteUnlistedMovies(movies)
      } catch (error) {
        console.error("Error in delayed cleanup:", error)
      }
    }, 60000) // Wait 1 minute before starting cleanup

    console.log("Added all movies to processing queue")
  } catch (error) {
    console.error("Error queueing movie schedules:", error)
    throw error
  }
}

// Store execution state
let isExecutingDailyTask = false
let lastCheckTime = 0

// Debounce mechanism with improved checks
let updateTimeout: NodeJS.Timeout | null = null
const DEBOUNCE_DELAY = 30000 // 30 seconds

export async function dailyTaskUpdates() {
  const now = Date.now()

  // Prevent multiple executions in rapid succession
  if (isExecutingDailyTask) {
    console.log("Daily task update already in progress. Skipping.")
    return
  }

  // Rate limit checks to once per minute
  if (now - lastCheckTime < 60000) {
    console.log("Checking too frequently. Skipping.")
    return
  }

  lastCheckTime = now

  // Clear any pending update
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }

  // Debounce the update
  updateTimeout = setTimeout(async () => {
    if (isExecutingDailyTask) return

    isExecutingDailyTask = true

    try {
      const currentDate = new Date().toLocaleDateString()
      const dailyUpdateRef = doc(db, "dailyTasks", "executionDate")

      const docSnap = await getDoc(dailyUpdateRef)

      // Check if we've already run today and also check when the last run was
      if (!docSnap.exists()) {
        console.log("First time executing daily task...")
        await generateMovieData()
        await setDoc(dailyUpdateRef, {
          date: currentDate,
          lastRun: new Date().toISOString(),
        })
      } else if (docSnap.data().date !== currentDate) {
        console.log("Executing daily task for a new day...")
        await generateMovieData()
        await setDoc(dailyUpdateRef, {
          date: currentDate,
          lastRun: new Date().toISOString(),
        })
      } else {
        // Check if the last run was more than 12 hours ago
        const lastRun = new Date(docSnap.data().lastRun || 0)
        const hoursElapsed =
          (new Date().getTime() - lastRun.getTime()) / (1000 * 60 * 60)

        if (hoursElapsed > 12) {
          console.log("More than 12 hours since last run, executing task...")
          await generateMovieData()
          await setDoc(dailyUpdateRef, {
            date: currentDate,
            lastRun: new Date().toISOString(),
          })
        } else {
          console.log(
            `Daily task already executed recently (${hoursElapsed.toFixed(
              1
            )} hours ago).`
          )
        }
      }
    } catch (error) {
      console.error("Error checking or updating daily task:", error)
    } finally {
      isExecutingDailyTask = false
    }
  }, DEBOUNCE_DELAY)
}
