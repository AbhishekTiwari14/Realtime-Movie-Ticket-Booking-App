export function getWeekDetails() {
  const today = new Date()
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i) 

    const day = date.getDay() 
    const formattedDate = {
      date: date.getDate(),
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()],
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day], 
    }

    weekDates.push(formattedDate)
  }

  return weekDates
}

