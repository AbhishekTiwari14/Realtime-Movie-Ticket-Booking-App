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
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

export type Seat = {
  status: "availabe" | "selected" | "booked"
  userId: string | null
  id: string
  row: string
  number: number
}

export type SeatContextType = {
  getAllSeats: (
    movieId: string,
    theaterId: string,
    showtimeId: string
  ) => Promise<Seat[]>
}

// type UserLocationData = {
//   city: string;
//   loading: boolean;
//   error: string | null;
//   locateCity: () => void;
// };

//seat data

// const seats - { A1: {status: "available", userId: null}, A2: {status: "available", userId: null}, A3: {status: "available", userId: null}, A4: {status: "available", userId: null}, A5: {status: "available", userId: null},
// B1: {status: "available", userId: null}, B2: {status: "available", userId: null}, B3: {status: "available", userId: null}, B4: {status: "available", userId: null}, A1: {status: "available", userId: null}, B5: {status: "available", userId: null},
// C1: {status: "available", userId: null}, C2: {status: "available", userId: null}, C3: {status: "available", userId: null}, C4: {status: "available", userId: null}, C5: {status: "available", userId: null},
// D1: {status: "available", userId: null}, D2: {status: "available", userId: null}}
