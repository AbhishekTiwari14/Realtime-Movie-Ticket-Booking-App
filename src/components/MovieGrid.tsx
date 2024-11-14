import { Star } from "lucide-react"

export function MovieGrid({
  //title,
  poster_path,
  vote_average,
}: {
  title: string
  poster_path: string
  vote_average: number
}) {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden w-68 my-4">
      <img
        src={`https://image.tmdb.org/t/p/original${poster_path}`}
        alt="poster"
        className="object-contain"
      />
      <span className="bg-black text-white p-1 flex items-center font-medium gap-4 pl-4">
        <Star color="yellow" className="fill-yellow-400 inline" />{" "}
        {vote_average < 1 ? "Not Rated Yet" : vote_average.toFixed(1) + " /10"}
      </span>
    </div>
  )
}
