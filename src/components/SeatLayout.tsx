import { Seat } from "./Seat"

export function SeatLayout() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-20">
        {Array.from({ length: 72 }, (_, i) => (
          <Seat key={i} />
        ))}
      </div>
    </div>
  )
}
