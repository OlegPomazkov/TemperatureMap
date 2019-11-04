export function setFillColor(minTemp, maxTemp, temp, levels) {
  const dT = maxTemp - minTemp
  const normT = temp - minTemp

  return `rgb(0, ${256*Math.floor(levels*normT/dT)/levels}, 0)`
}