import {SEAT} from "./Constants";
import Konva from "konva";

export const borderActions = {
  show: (border) => {
    border.visible(true);

    // border.setAttrs({
    //   stroke: "gray",
    //   strokeWidth: 0.5,
    //   dash: [5, 5], // Set the dash pattern (5 pixels on, 5 pixels off)
    // });
  },
  hide: (border) => {
    border.visible(false);
    // border.setAttrs({
    //   stroke: "none",
    //   strokeWidth: 0,
    // });
  },
  select: (border) => {
    border.setAttrs({
      stroke: "gray",
      strokeWidth: 1,
      dash: [5, 5], // Set the dash pattern (5 pixels on, 5 pixels off)
    });
  },
};

export const sectionRowTextPositions = (
  rowLabelGroup,
  cloneRowRight,
  seatsGroups,
  seats,
  rowSortType
) => {
  for (let i = 0; i < rowLabelGroup.children.length; i++) {
    const element = rowLabelGroup.children[i];
    const width = rowLabelGroup.children[i].width();
    const cloneRowRightElement = cloneRowRight.children[i];
    const rightText = String(cloneRowRightElement.attrs.text);

    const everyFirst = seatsGroups.children[i * seats].children[0];
    const everyLast = seatsGroups.children[(i + 1) * seats - 1].children[0];
    const minMargin =
      cloneRowRightElement.attrs.text.length === 2
        ? { x: 5, y: 0 }
        : { x: 0, y: 0 };
    const minMargin2 =
      cloneRowRightElement.attrs.text.length === 2
        ? { x: 10, y: 5 }
        : { x: 0, y: 0 };

    let hasMargin = 0;
    let hasMarginLeft = 0;

    if (rowSortType === "ABC") {
      hasMargin = rightText.length === 2 ? 13 : 0;
      hasMarginLeft = rightText.length === 2 ? 5 : 0;
    } else {
      hasMargin = rightText.length === 2 ? 17 : 0;
      hasMarginLeft = rightText.length === 2 ? 7 : 5;
    }

    element.position({
      x: everyFirst.x() - seatsGroups.offsetX() - width / 1.5 + minMargin2.x,
      y: everyFirst.y() - seatsGroups.offsetY() + width / 2 - minMargin2.y,
    });

    cloneRowRightElement.position({
      x: everyLast.x() - seatsGroups.offsetX() + width * 1.5 - minMargin.x,
      y: everyLast.y() - seatsGroups.offsetY() + width / 2,
    });
  }
};

export const tableActionsPosition = (
  type,
  startSeatBound,
  actionsGroupBound,
  seats
) => {
  const actionsXY = {};

  // Todo add cases to constant
  switch (type) {
    case "round":
      actionsXY.x = 0 - startSeatBound.width / 2 - actionsGroupBound.width / 2;
      actionsXY.y = 0 - startSeatBound.height / 2;
      break;
    case "rectangle":
      // actionsXY.x =
      //   0 - SEAT.margin - startSeatBound.width / 2 + actionsGroupBound.width / 2;
      actionsXY.x = 0 - SEAT.margin - actionsGroupBound.width / 2;
      actionsXY.y = 0 - actionsGroupBound.height;
      break;
    case "square":
      actionsXY.x =
        0 -
        startSeatBound.width / 2 +
        (seats * SEAT.size + (seats - 1) * SEAT.margin) / 2 -
        actionsGroupBound.width / 2;
      actionsXY.y = 0 - actionsGroupBound.height;
      break;
    default:
      break;
  }

  return { actionsXY };
};

export const isEmptySeats = {
  section: (mergedArr) => {
    let isEmpty = false;

    if (mergedArr.length) {
      for (let i = 0; i < mergedArr.length; i++) {
        const element = mergedArr[i];
        if (element.seats && !element.seats.length) {
          isEmpty = true;
        }
      }
    } else {
      isEmpty = true;
    }

    return isEmpty;
  },
  table: (mergedArr) => {
    let isEmpty = false;

    if (!mergedArr.length) {
      isEmpty = true;
    }

    return isEmpty;
  },
};

export const emptySeat = (seat, seatNumberText, seatWithNumGroup) => {
  seat.setAttrs({
    stroke: null,
  });

  seatNumberText.visible(false);

  seatWithNumGroup.on("mouseenter", () => {
    seat.setAttrs({
      stroke: "white",
    });
    seatNumberText.visible(true);
  });

  seatWithNumGroup.on("mouseleave", () => {
    seat.setAttrs({
      stroke: null,
    });
    seatNumberText.visible(false);
  });
};

export const fillSectionSeatFunction = (
  seat,
  recoverNumber,
  seatsBind,
  stage
) => {
  const { rowId } = seat;
  const seatId = seat.getId();

  seat.number = recoverNumber;
  seat.setAttrs({ number: recoverNumber, deleted: false });
  seat.find((node) => {
    if (node instanceof Konva.Text || node instanceof Konva.Image) {
      if (node instanceof Konva.Image) {
        node.setAttrs({ text: recoverNumber, number: recoverNumber });
        node.text = recoverNumber;
        node.number = recoverNumber;
      } else {
        node.text(recoverNumber);
      }

      node.visible(true);
    } else if (node instanceof Konva.Rect) {
      node.setAttrs({
        cornerRadius: 0,
      });

      node.setAttrs({
        stroke: "white",
      });
    }
  });

  seat.off("mouseenter");
  seat.off("mouseleave");
  let findRow = seatsBind.find((row) => row.id === rowId);
  let seatItem = findRow.seats.find((s) => s.id === seatId);

  seatItem.invalid = false;
  seatItem.number = recoverNumber;
};

export const findRemovedSectionNumber = (seat, seatsBind, configs) => {
  const seatId = seat.getId();

  const { rowId } = seat;
  const { seatSortType, seatDirection, seatStartsWith } = configs;
  const findRow = seatsBind.find((r) => r.id === rowId);
  let findSeatIndex = findRow.seats.findIndex((s) => s.id === seatId);
  const seatsMaxIndex = findRow.seats.length - 1;
  let returnNumber = 0;

  // Todo add cases to constant
  switch (seatSortType) {
    case "123":
      if (seatDirection === "19") {
        returnNumber = +seatStartsWith - 1 + findSeatIndex + 1;
      } else {
        returnNumber =
          seatsMaxIndex - findSeatIndex + 1 + (+seatStartsWith - 1);
      }

      break;
    case "135":
      if (seatDirection === "19") {
        returnNumber = findSeatIndex * 2 + 1 + (+seatStartsWith - 1);
      } else {
        returnNumber =
          (seatsMaxIndex - findSeatIndex) * 2 + 1 + (+seatStartsWith - 1);
      }

      break;
    case "246":
      if (seatDirection === "19") {
        returnNumber = findSeatIndex * 2 + 1 + (+seatStartsWith - 1);
      } else {
        returnNumber =
          (seatsMaxIndex - findSeatIndex) * 2 + 1 + (+seatStartsWith - 1);
      }

      break;
    case "ABC":
      let charCode;
      let text;

      if (seatDirection === "19") {
        charCode = seatStartsWith
          ? seatStartsWith.charCodeAt(0) + findSeatIndex
          : 65 + findSeatIndex;
      } else {
        charCode = seatStartsWith
          ? seatStartsWith.charCodeAt(0) + (seatsMaxIndex - findSeatIndex)
          : 65 + (seatsMaxIndex - findSeatIndex);
      }

      if (configs.dont_show_I && charCode >= 73 || configs.dont_show_O && charCode >= 79) {
          charCode += 1; // Skip 'I'
      }

      if (charCode > 90) {
        const offset = charCode - 91;
        const firstChar = String.fromCharCode(65 + offset);
        const secondChar = String.fromCharCode(65 + offset);
        text = `${firstChar}${secondChar}`;
      } else {
        text = String.fromCharCode(charCode);
      }

      returnNumber = text;

      break;
    default:
      break;
  }

  return returnNumber;
};

export const rotateTables = (rotation, seatsGroups, mainGroups) => {
  let oppositeRotation = -rotation;
  let seats = seatsGroups.getChildren();
  let groupChild = mainGroups.getChildren();
  const tableName = groupChild.find((g) => g.attrs.type === "name");
  const actionsArr = groupChild.find((g) => g.attrs.type === "action");
  tableName.rotation(oppositeRotation);

  // if (tableName) {
  //   if (rotation > 90) tableName.rotation(180);
  //   if (rotation < 90) tableName.rotation(0);
  //   if (rotation < -90) tableName.rotation(-180);
  // }

  for (let i = 0; i < seats.length; i++) {
    const element = seats[i].children[1];

    let defRotation =
      mainGroups.attrs.type === "round" ? (i * 360) / seats.length + 90 : 0;
    element.rotation(oppositeRotation - defRotation);
  }

  if (actionsArr) {
    for (let i = 0; i < actionsArr.children.length; i++) {
      const actionElement = actionsArr.children[i];
      actionElement.rotation(oppositeRotation);
    }
  }
};

export const getRemoveds = (seatsBind) => {
  let leftEmpty = 0;
  let rightEmpty = 0;
  const eachRowSeats = seatsBind.seats;

  if (eachRowSeats[0].number && eachRowSeats[eachRowSeats.length - 1].number) {

  } else {
    for (let j = 0; j < eachRowSeats.length; j++) {
      const seat = eachRowSeats[j];
      if (seat.number) {
        break;
      } else if (!seat.number) {
        leftEmpty++;
      }
    }

    for (let j = eachRowSeats.length - 1; j >= 0; j--) {
      const seat = eachRowSeats[j];
      if (seat.number) {
        break;
      } else if (!seat.number) {
        rightEmpty++;
      }
    }
  }

  return { leftEmpty, rightEmpty };
};

export const fillSkeletonLayer = (findSeats, bool) => {
  if (findSeats && findSeats.children.length) {
    for (let i = 0; i < findSeats.children.length; i++) {
      const seat = findSeats.children[i];
      const rect = seat.children.find((g) => g instanceof Konva.Rect);
      const text = seat.children.find((g) => g instanceof Konva.Text);
      rect.fill("#929292");
      if (text) text.destroy();
      if (seat.attrs.deleted) {
        seat.destroy();
      }
    }
  }
};

export const getMinMaxCoords = (mainGroups) => {
  let maxY = -Infinity;
  let minY = Infinity;

  let minX = Infinity;
  let maxX = -Infinity;

  minY = Object.values(mainGroups).reduce((max, current) => {
      let height  = current.getClientRect().height;
      const { y } = current.attrs;
      return y - height / 2 < max ? y - height / 2 : max;
  }, Infinity);

  maxY = Object.values(mainGroups).reduce((max, current) => {
    let height = current.getClientRect().height;
    const { y } = current.attrs;
    return y + height / 2 > max ? y + height / 2 : max;
  }, -Infinity);

  minX = Object.values(mainGroups).reduce((max, current) => {
    let width = current.getClientRect().width;
    const { x } = current.attrs;
    return x - width / 2 < max ? x - width / 2 : max;
  }, Infinity);

  maxX = Object.values(mainGroups).reduce((max, current) => {
    let width = current.getClientRect().width;
    const { x } = current.attrs;
    return x + width / 2 > max ? x + width / 2 : max;
  }, -Infinity)

  return { maxY, minY, minX, maxX };
};
