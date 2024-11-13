export function formatDate(releaseDate: string) {
  const [y, m, d] = releaseDate.split("-")
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`
}
