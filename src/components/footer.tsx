import { getMovieDetailsFromDocId } from "@/apis/getMovieDetailsFromDocId"

export function Footer() {
  getMovieDetailsFromDocId("426063_18Feb_T2_1800")
  return (
    <div className="bg-gradient-to-r from-fuchsia-500 to-rose-700 mt-32 py-4 px-2 text-white text-lg font-semibold text-center">
      Made by Abhishek Tiwari | GITHUB | LINKEDIN
    </div>
  )
}
