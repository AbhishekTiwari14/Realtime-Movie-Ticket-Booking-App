import { getCastAndCrew } from "@/apis/getCastAndCrew"
import { Crew } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import DisplayProfile from "./DisplayProfile"
import { Loader2 } from "lucide-react"

export default function MovieDetails() {
  const { movieId } = useParams()
  const { data, error, isLoading } = useQuery({
    queryKey: ["movieCredits", movieId],
    queryFn: () => getCastAndCrew(movieId),
    enabled: !!movieId,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) return <Loader2 />
  if (error) {
    console.log("error", data)
    return <p>An error occurred: {error.message}</p>
  }

  const seenIds = new Set()

  return (
    <div className="pt-8 px-4 max-w-full bg-slate-50">
      <div className="mt-5">
        <p className="text-2xl font-bold mb-8">Cast</p>
        <div className="flex mx-auto w-full h-auto gap-10 rounded-lg flex-wrap">
          {data?.cast?.slice(0, 6).map((actor: Crew) => {
            return <DisplayProfile {...actor} key={actor.id} />
          })}
        </div>
      </div>
      <div className="mt-16">
        <p className="text-2xl font-bold mb-8">Crew</p>
        <div className="flex mx-auto w-full h-auto gap-10 rounded-lg flex-wrap">
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
