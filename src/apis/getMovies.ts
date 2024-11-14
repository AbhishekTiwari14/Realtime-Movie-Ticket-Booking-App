export async function getMovies() {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_ACCESS_TOKEN}`,
    },
  }

  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1&region=IN",
      options
    )
    const data = await response.json()
    return data // Ensure data is returned here for useQuery
  } catch (error) {
    console.error("Error fetching movies:", error)
    throw error
  }
}
