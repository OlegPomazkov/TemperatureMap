export function interpolate(corners, temps, coords) {
  const x = coords[0]
  const x1 = corners[0][0]
  const x2 = corners[1][0]

  const y = coords[1]
  const y1 = corners[0][1]
  const y2 = corners[2][1]

  const dX = x2 - x1
  const dY = y2 - y1

  const fx_12 = temps[0]*(x2-x)/dX + temps[1]*(x-x1)/dX
  const fx_34 = temps[2]*(x2-x)/dX + temps[3]*(x-x1)/dX

  return (fx_12*(y2-y)/dY + fx_34*(y-y1)/dY)
}
