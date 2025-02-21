import { useAuth } from "@/contexts/AuthContext"
import { CitySearch } from "./CitySearch"
import { MovieSearch } from "./MovieSearch"
import { Button } from "./ui/button"
import { LogOut, ChevronDown, List } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { useEffect } from "react"

export function NavBar() {
  const { currentUser, userPhotoUrl, loginWithGoogle, logout } = useAuth()

  useEffect(() => {
    console.log("currentUser: ", currentUser)
  }, [currentUser])

  return (
    <>
      <header>
        <div className="my-2 px-8 flex justify-between items-center w-full h-auto">
          <Link to="/">
            <img src="/logo.png" alt="logo" className="h-10 md:h-14" />
          </Link>
          <MovieSearch />
          <CitySearch />
          {userPhotoUrl ? (
            <div className="flex items-center">
              <img
                src={userPhotoUrl}
                alt={`${currentUser?.displayName}'s profile`}
                className="h-9 w-9 rounded-full"
                loading="lazy"
              />
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none self-end align-bottom">
                  <ChevronDown
                    size={24}
                    className="ml-1 hover:cursor-pointer"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem>
                    <Link
                      to={`${currentUser.uid}/booking-history`}
                      className="flex items-center w-full"
                    >
                      <List size={20} className="mr-2" />
                      <span>Booking History</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center"
                  >
                    <LogOut className="mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              className="rounded-xl px-4 py-3 bg-blue-600"
              onClick={loginWithGoogle}
            >
              Login/Signup
            </Button>
          )}
        </div>
      </header>
      <hr />
    </>
  )
}
