import { useState } from "react"

export function useLocation() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords
    setUserLocation({ latitude, longitude })
    console.log(latitude, longitude)
  })

  return { userLocation }
}
