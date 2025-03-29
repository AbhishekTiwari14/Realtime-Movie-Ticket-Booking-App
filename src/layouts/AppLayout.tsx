import { Footer } from "@/components/footer"
import React, { Suspense } from "react"
import { Outlet } from "react-router-dom"

export function Applayout() {
  const NavBar = React.lazy(() => import("../components/NavBar"))
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="w-screen h-14" />}>
        <NavBar />
      </Suspense>
      <Outlet />
      <Footer />
    </div>
  )
}
