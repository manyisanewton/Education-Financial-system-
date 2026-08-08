export const formatKES = (value: number, compact = false) => {
  if (compact && value >= 1_000_000) return `KSh ${(value / 1_000_000).toFixed(2)}M`
  if (compact && value >= 1_000) return `KSh ${(value / 1_000).toFixed(0)}K`
  return `KSh ${value.toLocaleString('en-KE')}`
}
