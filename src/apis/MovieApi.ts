
export async function getMovies() {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNjlhOGU4YWZmZmJjZDJmZjQyNTJhZWU3OGZhMzEyOCIsIm5iZiI6MTczMTM1MTY5NS4yOTgwOTM4LCJzdWIiOiI2NzFmY2JiYmE0YWM4YTQzMmM1Y2Q0MzIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.WFhPt-4QrUE5opfAqjlIuJgNxgcF4-jhABk-aC85pFw'
    }
  };
  
  try {
    const response = await fetch(
      'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1',
      options
    );
    const data = await response.json();
    return data; // Ensure data is returned here for useQuery
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
}
