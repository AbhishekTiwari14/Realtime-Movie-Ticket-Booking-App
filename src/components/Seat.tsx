import { Square } from "lucide-react"
import { useState } from "react"

export function Seat() {
  const [filled, setFilled] = useState(false)
  return (
    <div
      className="relative inline-block cursor-pointer"
      onClick={() => setFilled(!filled)}
    >
      <Square
        fill={filled ? "blue" : "none"}
        stroke="currentColor"
        className={`${filled ? "fill-blue-500" : "hover:fill-blue-500"}`}
        size={48}
      />
      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
        1
      </span>
    </div>
  )
}
