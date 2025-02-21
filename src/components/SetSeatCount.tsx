import { useState } from "react"

export function SetSeatCount({
  seatCount,
  updateSeatCount,
  setPopoverOpen,
}: {
  seatCount: number
  updateSeatCount: (value: number) => void
  setPopoverOpen: () => void
}) {
  const [hoverSeatCount, setHoverSeatCount] = useState<number | null>(null)

  const svgVehicle: { [key: number]: string } = {
    1: "/cycle.svg",
    2: "/scooter.svg",
    3: "/auto.svg",
    4: "/hatchback.svg",
    5: "/hatchback.svg",
    6: "/suv.svg",
    7: "/suv.svg",
    8: "/bus.svg",
    9: "/bus.svg",
    10: "/bus.svg",
  }

  const displayedVehicle = svgVehicle[hoverSeatCount ?? seatCount]

  return (
    <div className="flex flex-col px-12 justify-center items-center gap-4">
      <p className="text-lg font-medium">How Many Seats?</p>
      <img src={displayedVehicle} alt="Vehicle icon" className="w-32 h-32" />
      <div className="grid grid-cols-5 lg:grid-cols-10 place-items-center gap-5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
          <button
            key={val}
            onClick={() => updateSeatCount(val)}
            onMouseEnter={() => setHoverSeatCount(val)}
            onMouseLeave={() => setHoverSeatCount(null)}
            className={`w-10 h-10 flex justify-center items-center rounded-full border border-gray-300 font-semibold text-lg text-center
              ${
                seatCount === val
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700"
              }`}
          >
            {val}
          </button>
        ))}
      </div>
      <button
        onClick={() => setPopoverOpen()}
        className="mt-8 text-white font-medium text-lg w-1/2 py-2 rounded-md bg-red-600 hover:shadow-lg"
      >
        Select Seats
      </button>
    </div>
  )
}
