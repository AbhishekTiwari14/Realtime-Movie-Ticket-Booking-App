import { Crew } from "@/types"

export function DisplayProfile({
  name,
  id,
  profile_path,
  character,
  department,
}: Crew) {
  return (
    <div className="flex flex-col shadow-2xl rounded-lg">
      <div className="overflow-hidden rounded-t-xl" key={id}>
        <img
          src={`https://image.tmdb.org/t/p/w185${profile_path}`}
          alt="Crew Image"
          className="align-middle w-full h-full"
        />
      </div>
      <div className="rounded-b-xl px-2">
        <p className="p-1 font-bold">{name}</p>

        {character && <p className="px-1">{character}</p>}
        {department && <p className="px-1">{department}</p>}
      </div>
    </div>
  )
}
