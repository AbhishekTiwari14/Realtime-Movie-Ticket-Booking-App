export async function getCastAndCrew(movieId: string | undefined) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_ACCESS_TOKEN}`,
    },
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`,
      options
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching movies:", error)
    throw error
  }
}
