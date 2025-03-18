import { getMovies } from "@/apis/getMovies";
import { useQuery } from "@tanstack/react-query";

function getMoviesData() {
  return useQuery({
    queryKey: ["nowPlayingMovies"],
    queryFn: getMovies,
    staleTime: 5 * 60 * 1000,
  })
}
