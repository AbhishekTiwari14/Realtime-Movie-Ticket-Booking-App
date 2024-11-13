import { Footer } from "@/components/footer"
import { NavBar } from "@/components/NavBar"
import { Outlet } from "react-router-dom"

export function Applayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <Outlet />
      <Footer />
    </div>
  )
}
