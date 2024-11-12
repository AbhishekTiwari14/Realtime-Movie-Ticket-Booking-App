import { Outlet } from "react-router-dom"
import { CitySearch } from "./CitySearch"
import { MovieSearch } from "./MovieSearch"
import { Button } from "./ui/button"

export function NavBar() {
  return (
    <>
      <header>
        <div className="my-2 lg:mx-8 flex justify-between items-center max-w-full h-auto">
          <img src="/logo.png" alt="logo" className="h-14" />
          <MovieSearch />
          <CitySearch />
          <Button className="rounded-xl px-4 py-3 bg-blue-600">
            Login/Signup
          </Button>
        </div>
      </header>
      <hr />
      <Outlet />
    </>
  )
}

{
  /* <img src="/searchIcon.svg" alt="search icon" />
        <input
          type="text"
          name="movieSearch"
          id="movieSearch" 
          placeholder="Search for Movies"
          className="w-2/5 border-gray-100 border-2 px-6 py-2 rounded-3xl "
        /> */
}
