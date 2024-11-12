import { MoviesList } from "@/components/MoviesList"
import { NavBar } from "@/components/NavBar"
import { createBrowserRouter } from "react-router-dom"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <NavBar />,
    children: [{ path: "/", element: <MoviesList /> }],
  },
])
