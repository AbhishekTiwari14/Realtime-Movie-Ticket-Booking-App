export function getMovie(movieId: string | undefined) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_ACCESS_TOKEN}`, 
    },
  }

  return fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`,
    options
  )
    .then((res) => res.json())
    .catch((err) => console.error("Error fetching movie details:", err))
}
