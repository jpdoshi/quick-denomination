
export const hardShadow = (offset = 3, bg = "#000") => ({
  borderWidth: 2.5,
  borderColor: "#000",
  // Standard CSS syntax: offsetX offsetY blurRadius spread color
  boxShadow: `${offset}px ${offset}px 0px 0px ${bg}`,
});