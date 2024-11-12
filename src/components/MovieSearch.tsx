export function MovieSearch() {
  return (
    <div className="relative w-2/5">
      <img
        src="/searchIcon.svg"
        alt="search icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
      />
      <input
        type="search"
        name="movieSearch"
        id="movieSearch"
        placeholder="Search for Movies"
        className="w-full border-gray-100 border-2 pl-12 pr-6 py-2 rounded-3xl"
      />
    </div>
  )
}
