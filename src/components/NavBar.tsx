import { useAuth } from "@/contexts/AuthContext"
import { CitySearch } from "./CitySearch"
import { MovieSearch } from "./MovieSearch"
import { Button } from "./ui/button"
import { useEffect } from "react"
import { LogOut, ChevronDown, List } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"


export function NavBar() {
  const { currentUser, loginWithGoogle, logout } = useAuth()


  useEffect(() => {
    console.log("User profile photo URL:", currentUser?.photoURL)
  }, [currentUser])

  return (
    <>
      <header>
        <div className="my-2 lg:mx-8 flex justify-between items-center max-w-full h-auto">
          <Link to="/">
            {" "}
            <img src="/logo.png" alt="logo" className="h-14" />
          </Link>
          <MovieSearch />
          <CitySearch />
          {currentUser?.photoURL ? (
            <div className="flex flex-row">
              <img
                src={currentUser.photoURL}
                alt="User Profile Photo"
                className="h-9 w-9 rounded-full "
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ChevronDown
                    size={24}
                    //fill="currentColor"
                    className="self-end mt-1 ml-1 hover:cursor-pointer"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mr-2">
                  <DropdownMenuItem>
                    <List size={20} />
                    <span>Booking History</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut />
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
