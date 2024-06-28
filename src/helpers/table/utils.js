import Konva from "konva";
import { createSeat, emptySeat } from "../seatUtils";
import { SEAT } from "../Constants";
import { uid } from "uid";

const seatSize = SEAT.size; // Size of each seat (square)
const seatMargin = 10; // Margin between each seat

export const roundTableBind = (seats, seatsBind, name) => {
  const seatsLength = seatsBind.length;
  let tableRadius = Math.max(seatsLength * 8, 30); // Calculate the tableRadius dynamically

  let seatDistance = tableRadius + seatSize + 10;
  let roundTableGroup = new Konva.Group();
  roundTableGroup.type = "round";
  let table = new Konva.Circle({
    radius: tableRadius,
    stroke: "white",
    strokeWidth: 1,
  });
  roundTableGroup.add(table);

  let mainSeatGroup = new Konva.Group();
  mainSeatGroup.type = "seatGroup";

  for (let i = 0; i < seatsLength; i++) {
    let angle = (i / seatsLength) * Math.PI * 2;

    let seatX = Math.cos(angle) * seatDistance;
    let seatY = Math.sin(angle) * seatDistance;

    let seatRotation = angle + Math.PI / 2; // calculate rotation angle

    let offsetX = Math.cos(seatRotation) * (seatSize / 2);
    let offsetY = Math.sin(seatRotation) * (seatSize / 2);

    let seatGroup = new Konva.Group({
      x: seatX - offsetX,
      y: seatY - offsetY,
      rotation: seatRotation * (180 / Math.PI), // convert rotation to degrees
    });


    const seatText = seatsBind[i].number;
    const invalid = seatsBind[i].invalid;

    const rotation = -(seatRotation * (180 / Math.PI));

    const {seat, seatNumber} = createSeat(0, 0, seatText, invalid, seatGroup, rotation);

    seatGroup.setAttrs({
      deleted: !(seatText || seatText === 0)
    })

    seatGroup.setAttrs({ number: seatText, id: seatsBind[i].id, invalid });
    seatGroup.number = seatText;
    seatGroup.invalid = invalid;
    seatGroup.id = seatsBind[i].id;

    if (!seatText && seatText !== 0) {
      emptySeat(seat, seatNumber, seatGroup);
    }

    mainSeatGroup.add(seatGroup);
  }

  roundTableGroup.add(mainSeatGroup);

  return { roundTableGroup, mainSeatGroup };
};

export const rectangleTableBind = (seatsBind, name) => {
  const rectangleTableGroup = new Konva.Group();
  rectangleTableGroup.type = "rectangle";

  let seatCount = seatsBind.length; // Number of seats
  let rectHeight = 100;
  let rectWidth = (seatCount / 2) * (seatSize + seatMargin) - seatMargin;
  let rect = new Konva.Rect({
    width: rectWidth,
    height: rectHeight,
    stroke: "white",
    strokeWidth: 1,
    offsetX: rectWidth / 2,
    offsetY: rectHeight / 2
  });

  rect.type = "rectTable";
  rectangleTableGroup.add(rect);

  // Calculate the number of seats that can fit on each side
  let seatGroup = new Konva.Group();
  seatGroup.type = "seatGroup";

  // let topGroup = new Konva.Group();
  // Arrange seats on the top side
  for (let i = 0; i < seatCount; i++) {
    let seatWithNum = new Konva.Group();

    const invalid = seatsBind[i].invalid;
    const seatText = seatsBind[i].number;

    const seatTop = i < Math.floor(seatCount / 2) ?  -(seatSize + seatMargin) - rectHeight / 2 : rectHeight / 2 + 10;
    const seatLeft = i < Math.floor(seatCount / 2) ? i * (seatSize + seatMargin) - rectWidth / 2 : (i -  Math.floor(seatCount / 2)) * (seatSize + seatMargin) - rectWidth / 2;

    // if (!seatText && seatText != 0) {
    //   seatOption.cornerRadius = 17.5;
    // }

    const {seat, seatNumber} = createSeat(seatLeft, seatTop, seatText, invalid, seatWithNum);

    seatWithNum.setAttrs({ deleted: !(seatText || seatText === 0) });
    seatWithNum.setAttrs({ number: seatText, id: seatsBind[i].id, invalid });

    seatWithNum.number = seatText;
    seatWithNum.invalid = invalid;
    seatWithNum.id = seatsBind[i].id;

    if (!seatText && seatText !== 0) {
      emptySeat(seat, seatNumber, seatWithNum);
    }

    seatGroup.add(seatWithNum);
  }

  rectangleTableGroup.add(seatGroup);

  return { rectangleTableGroup, seatGroup, rect };
};

export const squareTableBind = (seatsBind, stage) => {
  const squareTableGroup = new Konva.Group();
  const square = new Konva.Rect({
    stroke: "white",
    strokeWidth: 1,
  });

  squareTableGroup.add(square);
  let seatsGroup = new Konva.Group();
  seatsGroup.type = "seatGroup";

  const calc = Math.floor(seatsBind.length / 4);
  const borderSize = calc * seatSize + calc * seatMargin;
  square.setAttrs({
    width: borderSize,
    height: borderSize,
    offsetX: borderSize / 2,
    offsetY: borderSize / 2
  });

  for (let i = 0; i < 4; i++) {
    let slicedArray = seatsBind.slice(i * calc, i * calc + calc);

    let horY;
    let verX;
    if (i === 0) horY = square.y() - seatSize - seatMargin - borderSize / 2;
    if (i === 2) {
      horY = square.y() + square.height() + seatMargin - borderSize / 2;
      slicedArray = slicedArray.reverse();
    }

    if (i === 1) verX = square.x() + square.width() + seatMargin - borderSize / 2;
    if (i === 3) {
      verX = square.x() - seatMargin - seatSize - borderSize / 2;
      slicedArray = slicedArray.reverse();
    }

    if (i === 0 || i === 2) {
      drawSeats(square.x(), horY, slicedArray, "horizontal", i);
    } else if (i === 1 || i === 3) {
      drawSeats(verX, square.y(), slicedArray, "vertical", i);
    }
  }

  function drawSeats(x, y, seatsBind, type, side) {
    const seatsPerSide = seatsBind.length;

    for (let i = 0; i < seatsBind.length; i++) {
      const seatText = seatsBind[i].number;
      const invalid = seatsBind[i].invalid;

      const saveIndex = side !== 0 ? side * seatsPerSide + i + 1 : i + 1;

      const seatWithNum = new Konva.Group();

      let x_;
      let y_;

      if (type === "horizontal") {
        x_ = 5 + x + i * (seatSize + seatMargin) - borderSize / 2;
        y_ = y;
      } else {
        x_ = x;
        y_ = 5 + y + i * (seatSize + seatMargin) - borderSize / 2;
      }


      // if (!seatText && seatText != 0) {
      //   seatOption.cornerRadius = 17.5;
      // }

      seatWithNum.setAttrs({ deleted: !(seatText || seatText === 0) })
      const {seat, seatNumber} = createSeat(x_, y_, seatText, invalid, seatWithNum);

      seatWithNum.id = seatsBind[i].id;
      seatWithNum.invalid = invalid;
      seatWithNum.setAttrs({
        number: seatText,
        id: seatsBind[i].id,
        invalid,
        saveIndex,
      });

      seatWithNum.number = seatText;

      if (!seatText && seatText !== 0) {
        emptySeat(seat, seatNumber, seatWithNum);
      }

      seatsGroup.add(seatWithNum);
    }
  }

  return { squareTableGroup, seatsGroup, square };
};

export const recoverTableSeatNumber = (seat, seatsBind, id, configs) => {
  fillSeatFunction(seat, seatsBind);
};


const fillSeatFunction = (seat, seatsBind) => {
  const { index } = seat;
  seat.number = index + 1;
  let numberNode;
  const seatId = seat.id;

  seat.find((node) => {
    if (node instanceof Konva.Rect) {
      node.setAttrs({
        cornerRadius: 0,
      });
      node.setAttrs({
        stroke: "white",
      });

    } else {
      if (!seat.invalid) {
        node.setAttrs({
          text: seat.number
        })

      } else {
        node.setAttrs({
          text: "",
          fontFamily: "icon",
          fontSize: 24,
          width: SEAT.size,
          height: SEAT.size,
          offsetX: SEAT.size/2,
          offsetY: SEAT.size/2
        })
      }
      node.setAttrs({ number: seat.number })
      node.visible(true);
      numberNode = node;
    }
  });
  seat.off("mouseenter");
  seat.off("mouseleave");
  let seatItem = seatsBind.find((s) => s.id === seatId);
  seatItem.number = seat.number;
  seat.setAttrs({ text: seat.number, number: seat.number })

};

export const mergeArrays = (oldData, newData) => {
  const mergedArray = [];
  for (let i = 0; i < newData.length; i++) {
    const seat = newData[i];
    if (oldData[i]) {
      seat.number = oldData[i].number;
      seat.id = oldData[i].id;
      seat.invalid = oldData[i].invalid;
    }
    mergedArray.push(seat);
  }

  return mergedArray;
};

export const mergeSecArrays = (arr1, arr2) => {
  const mergedArray = [];
  const arr2Length = arr2.length;

  for (let i = 0; i < arr2Length; i++) {
    const arr2Seat = arr2[i];

    const seats = arr2[i].seats;
    const seatLength = arr2[i].seats.length;

    if (arr1[i]) arr2Seat.id = arr1[i].id;

    for (let j = 0; j < seatLength; j++) {
      const seat = seats[j];
      if (arr1[i]) {
        if (arr1[i].seats[j]) {
          seat.id = arr1[i].seats[j].id;
          seat.invalid = arr1[i].seats[j].invalid;
          if (!arr1[i].seats[j].number) {
            seat.number = null;
          }
        }
      }
    }

    mergedArray.push(arr2Seat);
  }

  return mergedArray;
};
