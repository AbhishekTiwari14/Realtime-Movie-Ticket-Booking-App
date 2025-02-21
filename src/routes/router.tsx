import ProtectedRoute from "@/components/ProtectedRoute"
import { ScrollToTop } from "@/components/ScrollToTop"
import { Applayout } from "@/layouts/AppLayout"
import { BookingsHistoryPage } from "@/pages/BookingsHistoryPage"
import { Homepage } from "@/pages/HomePage"
import { Moviepage } from "@/pages/MoviePage"
import { PaymentsPage } from "@/pages/PaymentsPage"
import { SeatSelectionPage } from "@/pages/SeatSelectionPage"
import { ShowSelectionPage } from "@/pages/ShowSelectionPage"
import { createBrowserRouter } from "react-router-dom"

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ScrollToTop>
        <Applayout />
      </ScrollToTop>
    ),
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
    element: (
      <ProtectedRoute>
        <SeatSelectionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "booking/:docId/payment",
    element: (
      <ProtectedRoute>
        <PaymentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ":userId/booking-history",
    element: (
      <ProtectedRoute>
        <BookingsHistoryPage />
      </ProtectedRoute>
    ),
  },
])
