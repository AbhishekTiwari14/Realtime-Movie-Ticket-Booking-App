export function getWeekDetails() {
  const today = new Date()
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i) // Set the date to the current day + i

    const day = date.getDay() // Day of the week (0=Sunday, 6=Saturday)
    const formattedDate = {
      date: date.getDate(),
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()], // Month (0-11, so we add 1)
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day], // Day abbreviation
    }

    weekDates.push(formattedDate)
  }

  return weekDates
}

