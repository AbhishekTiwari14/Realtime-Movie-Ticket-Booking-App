export function convertSeatIdToIndex(seatId: string){
    const seatNumber = parseInt(seatId.slice(1), 10);
    const row = seatId[0]
    let rowVal = row.charCodeAt(0) - "A".charCodeAt(0)
    rowVal*= 12
    return seatNumber + rowVal - 1
}