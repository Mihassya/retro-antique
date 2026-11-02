/** Russian plural: plural(5, ['вещь', 'вещи', 'вещей']) → '5 вещей'. */
export function plural(n: number, [one, few, many]: [string, string, string]) {
  const mod10 = n % 10
  const mod100 = n % 100
  const word = mod10 === 1 && mod100 !== 11 ? one : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few : many
  return `${n} ${word}`
}
