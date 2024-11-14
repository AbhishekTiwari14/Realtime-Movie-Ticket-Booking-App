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

