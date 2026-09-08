import { Platform } from "react-native";

// Hard flat Neubrutalist shadow definition for universal cross-platform rendering
export const hardShadow = (offset = 3, bg = '#000') => ({
  borderWidth: 2.5,
  borderColor: '#000',
  ...Platform.select({
    web: {
      boxShadow: `${offset}px ${offset}px 0px 0px ${bg}`,
    },
    default: {
      shadowColor: bg,
      shadowOffset: { width: offset, height: offset },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
  }),
});