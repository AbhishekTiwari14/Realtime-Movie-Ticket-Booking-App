export function formatTime(t: number) {
  let hours = 0,
    mins = 0
  hours = Math.floor(t / 60)
  mins = t % 60
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`
  } else if (hours > 0) return `${hours} hr`
  else return `${mins} mins`
}
