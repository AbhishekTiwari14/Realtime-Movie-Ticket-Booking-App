import { getCastAndCrew } from "@/apis/getCastAndCrew"
import { Crew } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { DisplayProfile } from "./DisplayProfile"

export function MovieDetails() {
  const { movieId } = useParams()
  const { data, error, isLoading } = useQuery({
    queryKey: ["movieCredits", movieId], // Add movieId to queryKey
    queryFn: () => getCastAndCrew(movieId), // Fetch details for the specific movie
    enabled: !!movieId, // Ensure the query only runs when movieId is available
  })

  if (isLoading) return <p>Loading...</p>
  if (error)
    return <p>An error occurred: {error.message} console.log("error", data)</p>

  const seenIds = new Set()

  return (
    <div className="pt-8 px-16 max-w-full bg-slate-50">
      <div className="mt-5">
        <p className="text-2xl font-bold mb-8">Cast</p>
        <div className="flex mx-auto w-full h-auto gap-10 rounded-lg">
          {data?.cast?.slice(0, 6).map((actor: Crew) => {
            return <DisplayProfile {...actor} />
          })}
        </div>
      </div>
      <div className="mt-16">
        <p className="text-2xl font-bold mb-8">Crew</p>
        <div className="flex mx-auto w-full h-auto gap-10 rounded-lg">
          {data?.crew
            ?.filter((person: Crew) => person.known_for_department !== "Acting")
            .filter((person: Crew) => {
              if (seenIds.has(person.id)) {
                return false
              } else {
                seenIds.add(person.id)
                return true
              }
            })
            .slice(0, 6)
            .map((person: Crew) => {
              return <DisplayProfile {...person} key={person.id} />
            })}
        </div>
      </div>
    </div>
  )
}
