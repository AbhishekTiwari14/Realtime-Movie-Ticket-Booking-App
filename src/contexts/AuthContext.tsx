/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import {
  onAuthStateChanged,
  User,
  signInWithPopup,
  signOut,
} from "firebase/auth"
import { auth, googleProvider } from "../lib/firebase"
import { AuthContextType } from "@/types"

// Create the AuthContext with a default value of null
const AuthContext = createContext<AuthContextType | null>(null)

// AuthProvider component to provide auth state to its children
export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)

      if (user && user.photoURL) {
        setUserPhotoUrl(user.photoURL)


      } else {
        setUserPhotoUrl(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Google Sign-In Error:", error)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout Error:", error)
    }
  }
  const value = {
    currentUser,
    userPhotoUrl,
    loginWithGoogle,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
