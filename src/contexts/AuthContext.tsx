// src/context/AuthContext.tsx
import React, {
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

// Define the shape of the context data
interface AuthContextType {
  currentUser: User | null
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

// Create the AuthContext with a default value of null
const AuthContext = createContext<AuthContextType | null>(null)

// AuthProvider component to provide auth state to its children
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Set up a listener for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsubscribe // Clean up the listener on unmount
  }, [])

  // Google login function
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Google Sign-In Error:", error)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout Error:", error)
    }
  }

  // Value provided by the AuthContext
  const value = {
    currentUser,
    loginWithGoogle,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Custom hook to use AuthContext in other components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
