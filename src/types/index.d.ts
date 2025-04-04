export type Movie = {
  id: number
  title: string
  overview: string
  poster_path: string
  vote_average: number
}

export type Crew = {
  id: number
  name: string
  character?: string
  department?: string
  known_for_department?: string
  profile_path: string
}

export type AuthContextType = {
  currentUser: User | null
  userPhotoUrl: string | null
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

export type SeatStatus = "available" | "selected" | "booked"

export type Seat = {
  status: SeatStatus
  userId: string | null
  id: string
  row: string
  number: number
  selectionTimestamp?: string
}

export type MovieSchedule = {
  seats: Seat[]
  movieTitle: string
  theaterName: string
  showTime: string
  date: string
  month: string
  day: string
}

export type Booking = {
  amount: number
  movieTitle: string
  date: string
  seats: string[]
  showtime: string
  theater: string
  bookingId: string
  paymentId: string
}
