import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react"
import {
  onAuthStateChanged,
  User,
  signInWithPopup,
  signOut,
} from "firebase/auth"
import { auth, googleProvider } from "../lib/firebase"
import { AuthContextType } from "@/types"

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setUserPhotoUrl(user?.photoURL || null)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    console.log("img: ", userPhotoUrl)
  }, [userPhotoUrl])

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Google Sign-In Error:", error)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout Error:", error)
    }
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      userPhotoUrl,
      loginWithGoogle,
      logout,
      loading,
    }),
    [currentUser, userPhotoUrl, loginWithGoogle, logout, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
