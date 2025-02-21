import { useEffect, type PropsWithChildren } from "react"
import { useLocation } from "react-router-dom"

export const ScrollToTop: React.FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto", 
    })
  }, [location.pathname])

  return <>{children}</>
}
