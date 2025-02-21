import { useAuth } from "@/contexts/AuthContext"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loginWithGoogle } = useAuth()

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">You must sign in to access this page.</p>
        <button
          onClick={loginWithGoogle}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
