import { Crew } from "@/types"

export function DisplayProfile({
  name,
  id,
  profile_path,
  character,
  department,
}: Crew) {
  return (
    <div className="flex flex-col shadow-2xl rounded-lg w-[138px] h-[250px]">
      <div className="overflow-hidden rounded-t-xl w-full" key={id}>
        <img
          src={`https://image.tmdb.org/t/p/w185${profile_path}`}
          alt="Crew Image"
          className="w-full h-44 object-cover"
        />
      </div>
      <div className="rounded-b-xl px-2 flex-1">
        <p className="p-1 font-bold text-center break-words">{name}</p>

        {character && (
          <p className="px-1 text-center text-sm break-words">{character}</p>
        )}
        {department && (
          <p className="px-1 text-center text-sm break-words">{department}</p>
        )}
      </div>
    </div>
  )
}
