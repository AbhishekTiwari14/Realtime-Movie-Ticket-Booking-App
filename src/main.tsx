//import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { RouterProvider } from "react-router-dom"
import { router } from "./routes/router.tsx"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { AuthProvider } from "./contexts/AuthContext.tsx"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  //<StrictMode>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
    <ReactQueryDevtools />
  </QueryClientProvider>
  //</StrictMode>
)
