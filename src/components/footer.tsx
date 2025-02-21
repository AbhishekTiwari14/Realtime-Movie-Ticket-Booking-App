import { Link } from "react-router-dom"

export function Footer() {
  return (
    <div className="bg-gradient-to-r from-gray-950 via-red-950 to-gray-900 mt-32 py-3 px-2 text-white text-lg font-semibold text-center">
      Made by Abhishek Tiwari:{" "}
      <Link
        to="https://github.com/AbhishekTiwari14"
        className="hover:cursor-pointer hover:text-blue-400 hover:underline"
      >
        GITHUB
      </Link>
    </div>
  )
}
