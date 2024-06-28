export const bindSectionConfigs = (section) => {
  const sectionConfig = { ...section };
  const rowType = sectionConfig.rowSortType;
  const seatType = sectionConfig.seatSortType;
  if (rowType === "ABC") {
    if (sectionConfig.rowStartsWith) {
      if (!isNaN(+sectionConfig.rowStartsWith)) {
        sectionConfig.rowStartsWith = "A";
      }

      if (sectionConfig.rowStartsWith.length > 1) {
        const firstChar = sectionConfig.rowStartsWith.charAt(0);
        const restChars = sectionConfig.rowStartsWith.substring(1);

        if (!isNaN(+restChars)) {
          sectionConfig.rowStartsWith = sectionConfig.rowStartsWith.slice(0, 1);
        }
      }
    }
  } else if (rowType === "123" || rowType === "246" || rowType === "135") {
    if (isNaN(+sectionConfig.rowStartsWith)) {
      sectionConfig.rowStartsWith = 1;
    }
  }

  if (seatType === "ABC" && !isNaN(+sectionConfig.seatStartsWith)) {
    if (sectionConfig.seatStartsWith) {
      sectionConfig.seatStartsWith = "A";
    }
  } else if (seatType === "123" || seatType === "246" || seatType === "135") {
    if (isNaN(+sectionConfig.seatStartsWith)) {
      sectionConfig.seatStartsWith = 1;
    }
  }

  return sectionConfig;
};
