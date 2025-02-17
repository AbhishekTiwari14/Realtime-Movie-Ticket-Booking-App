import { Applayout } from "@/layouts/AppLayout"
import { Homepage } from "@/pages/HomePage"
import { Moviepage } from "@/pages/MoviePage"
import { SeatSelectionPage } from "@/pages/SeatSelectionPage"
import { ShowSelectionPage } from "@/pages/ShowSelectionPage"
import { createBrowserRouter } from "react-router-dom"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Applayout />,
    children: [
      {
        path: "",
        element: <Homepage />,
      },
      {
        path: "/:movieId",
        element: <Moviepage />,
      },
      {
        path: "/:movieId/select-show",
        element: <ShowSelectionPage />,
      },
    ],
  },
  {
    path: "booking/:docId",
    element: <SeatSelectionPage />,
  },
])
