import Konva from "konva";
import {uid} from "uid";
import _, {cloneDeep} from "lodash";
import {SEAT, TextParams} from "../Constants";
import {mainGroups} from "@/core/MainGroups";
import {seatsGroups} from "@/core/SeatsGroup";
import {AppStage} from "@/core/AppStage";
import {updateSection} from "./_generator";

export const bindRowsAndSeats = (configs) => {
  const {
    // name,
    rowSortType,
    rows,
    seatSortType,
    seats,
    dont_show_I,
    dont_show_O,
    // label_left,
    // label_right,
    // rowSpacing,
    // seatSpacing,
    rowStartsWith,
    seatStartsWith,
    seatDirection,
    rowDirection,
    numbers_order
  } = configs;

  let rowSeatData = {};
  let sectionSeatsArr = [];
  let idx = 0;
  const layerId = configs.layerId ? configs.layerId : null;
  const currentSeats = layerId ? seatsGroups.get(layerId) : null;

  // const allSeats = layerId ? currentSeats.children : null;
  
  for (let i = 0; i < rows; i++) {
    let currentRowStartsWith = rowStartsWith ? typeof rowStartsWith === 'number' ? rowStartsWith : rowStartsWith.charCodeAt(0) : 65;
    if(rowSortType === '246' && rowStartsWith && rowStartsWith && rowStartsWith % 2 === 1) {
      currentRowStartsWith += 1
    }
    const charCod = currentRowStartsWith + idx;

    if (rowSortType === 'ABC' && (dont_show_I && charCod === 73 || dont_show_O && charCod === 79)) {
      idx++
    }
    const rowText = bindRows(idx, rowSortType, rowStartsWith, configs);

    rowSeatData[rowText.text] = [];

    let seatIdx = 0;

    for (let j = 0; j < seats; j++) {
      const currentSeatStartsWith = seatStartsWith ? typeof seatStartsWith === 'number' ? seatStartsWith : seatStartsWith.charCodeAt(0) : 65;
      const charSeatCode = currentSeatStartsWith + seatIdx;

      if (seatSortType === 'ABC' && (dont_show_I && charSeatCode === 73 || dont_show_O && charSeatCode === 79)) {
        seatIdx++
      }

      // if(numbers_order && allSeats && allSeats[i*seats + j].attrs.deleted) {
      //   seatIdx--
      // } 
      
      const seatText = bindRows(seatIdx, seatSortType, seatStartsWith, configs, 'seat');
      rowSeatData[rowText.text].push({
        number: seatText.text,
        id: uid(6),
        invalid: false,

      });

      seatIdx++
    }

    idx++
  }

  for (const key in rowSeatData) {
    const element = rowSeatData[key];
    sectionSeatsArr.push({ key, id: uid(6), seats: element });
  }

  if (rowDirection === "91") {
    const fliped = flipAndSortKeys(sectionSeatsArr);
    sectionSeatsArr = fliped;
  }

  if (seatDirection === "91") {
    const fliped = flipObject(sectionSeatsArr);
    sectionSeatsArr = fliped;
  }

  return { rowSeatData: sectionSeatsArr };
};

const flipAndSortKeys = (jsonObj) => {
  let newArr = _.cloneDeep(jsonObj);

  const reverse = _.cloneDeep(jsonObj).reverse();

  for (let i = 0; i < reverse.length; i++) {
    newArr[i].key = reverse[i].key;
  }

  return newArr;
};

export const flipObject = (obj) => {
  let newArr = _.cloneDeep(obj);
  
  for (let i = 0; i < newArr.length; i++) {
    if(newArr[i].shift) {
      newArr[i].shift = -newArr[i].shift;
    }
    newArr[i].seats = newArr[i].seats.reverse();
  }
  return newArr;
};

const bindRows = (index, rowSortType, startsWith, configs, type) => {
  let text = "";
  let charCode;
  
  switch (rowSortType) {
    case "ABC":
      charCode = startsWith ? startsWith.charCodeAt(0) + index : 65 + index;

      // if (type === 'seat') {
      //   if (dont_show_IO) {
      //     if (charCode >= 73) {
      //       charCode += 1; // Skip 'I'
      //     }
      //     if (charCode >= 79) {
      //       charCode += 1; // Skip 'O'
      //     }
      //   }
      // }

      if (charCode > 90) {
        const offset = charCode - 91;
        const firstChar = String.fromCharCode(65 + offset);
        const secondChar = String.fromCharCode(65 + offset);
        text = `${firstChar}${secondChar}`;
      } else {
        let char = String.fromCharCode(charCode);
        text = char;
        if (startsWith.length === 2) {
          text = `${char}${char}`;
        }
      }
      break;
    case "123":

      if (startsWith) {
        text = +startsWith + index ; // concatenate startsWith and index
      } else {
        text = index + 1; // use sequence 1, 2, 3, ..., n * m for row labels
      }

      break;
    case "135":
      if (startsWith) {
        let startsWithVal = startsWith;
        if(startsWith === 0) {
          startsWithVal = 1;
        } else if (startsWith % 2 === 0) {
          startsWithVal = +startsWith - 1;
          // if(type === "seat") {
          //   configs.seatStartsWith = startsWithVal
          // } else {
          //   configs.rowStartsWith = startsWithVal
          // }
        }
        text = +startsWithVal + index * 2 ;
      } else {
        text = index * 2 + 1;
      }

      break;
    case "246":
      if (startsWith) {
        let startsWithVal = startsWith;
        if(startsWith % 2 !== 0) {
          startsWithVal = +startsWith + 1;
          // if(type === "seat") {
          //   configs.seatStartsWith = startsWithVal
          // } else {
          //   configs.rowStartsWith = startsWithVal
          // }
        }
        text = +startsWithVal + index * 2;
      } else {
        text = index + 2;
      }

      break;
    default:
      break;
  }
  return { text, charCode };
};

export const generateRowGroup = (
  i,
  text = '',
  rowLabelX,
  rowLabelY,
  seatRadius,
  rowSpacing,
  // seatSpacing
) => {

  return {
    id: uid(6),
    text,
    fontSize: 24,
    fontFamily: "Lato-Bold",
    width: 44,
    height: 35,
    fill: "white",
    align: TextParams.ALIGN_CENTER,
    verticalAlign: "middle",
    align: 'center',
    rowSpacing,
    offset: {
      x: 22,
      y: 17.5,
    },
  };
};

export const drawSeatGroupBorder = () => {
  let layerBorder = new Konva.Rect({
    type: "border",
    stroke: "gray",
    strokeWidth: 1,
    dash: [5, 5],
    x: -5,
    y: -5
  });

  let coverLayer = new Konva.Rect({
    type: "cover"
  })

  return { layerBorder, coverLayer };
};

export const recoverSectionSeatNumber = (seat, seatsBind, id, configs) => {
  const returnNumber = findRemovedNumber(seat, seatsBind, configs);

  fillSeatFunction(seat, returnNumber, seatsBind, configs);

  updateSection(id, configs);

  return returnNumber;
};

const findRemovedNumber = (seat, seatsBind, configs) => {
  const seatId = seat.getId();

  const { rowId } = seat;
  const { seatSortType, seatDirection, seatStartsWith } = configs;
  const findRow = seatsBind.find((r) => r.id === rowId);
  let findSeatIndex = findRow.seats.findIndex((s) => s.id === seatId);
  const seatsMaxIndex = findRow.seats.length - 1;

  let returnNumber = 0;
  switch (seatSortType) {
    // Todo add cases to constant
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
          charCode += 1;
      }

      if (charCode > 90) {
        const offset = charCode - 91;
        const firstChar = String.fromCharCode(65 + offset);
        const secondChar = String.fromCharCode(65 + offset);
        text = `${firstChar}${secondChar}`;
      } else {
        let char = String.fromCharCode(charCode);
        text = char;
      }
      returnNumber = text;
      break;

    default:
      break;
  }

  return returnNumber;
};

const fillSeatFunction = (seat, recoverNumber, seatsBind, configs) => {
  const { rowId } = seat;
  const seatId = seat.getId();
  let numberNode;
  const { seats, seatSpacing } = configs;
  const sectionWidth = (SEAT.size + 5 + 2 * seatSpacing) * seats - 2 * seatSpacing;
  seat.number = recoverNumber;
  seat.setAttrs({number: recoverNumber, deleted: false })
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
          text: recoverNumber
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
      node.setAttrs({ number: recoverNumber })
      node.visible(true);
      // numberNode = node;
    }
  });

  seat.off("mouseenter");
  seat.off("mouseleave");
  let findRow = seatsBind.find((row) => row.id === rowId);
  let seatItem = findRow.seats.find((s) => s.id === seatId);


  if(seat.attrs.x < 0) {
    findRow.shift = findRow.shift - seat.attrs.x;
  } else if (seat.attrs.x + SEAT.size + 5 >= sectionWidth) {
    const newShift = findRow.shift - (seat.attrs.x + SEAT.size + 5 - sectionWidth); 
    findRow.shift = newShift;
  }
  seatItem.number = recoverNumber;
};


export const mergeArrays = (arr1, arr2, rowDir) => {
  const mergedArray = [];
  const arr2Length = arr2.length;

  for (let i = 0; i < arr2Length; i++) {
  
    const arr2Seat = arr2[i];
    const arr2Next = arr2[i + 1] ? arr2[i + 1] : null;
    const arr2Prev = arr2[i - 1] ? arr2[i - 1] : null;
    const seats = arr2[i].seats;
    const seatLength = arr2[i].seats.length;

    const checkEditedLabel = arr1[i] && (arr1[i].editedKey || arr1[i].editedKey === '');
  
    const editedLabel = checkEditedLabel ? arr1[i].editedKey : null;

    if(checkEditedLabel) {
      if(rowDir == '91' && arr1.length != arr2Length) {
        if(arr1.length < arr2Length && arr2Next) {
          arr2Next.key = editedLabel;
          arr2Next.editedKey = editedLabel;
        } else if (arr1.length > arr2Length && arr2Prev) {
          arr2Prev.key = editedLabel;
          arr2Prev.editedKey = editedLabel;
        }
      } else {
        arr2Seat.key = editedLabel;
        arr2Seat.editedKey = editedLabel;
      }
    } 

    const arr1Index = rowDir === '19' ? i : i - arr2Length + arr1.length ;
    
    if (arr1[arr1Index]) arr2Seat.id = arr1[arr1Index].id;
    if(arr1[arr1Index] && arr1[arr1Index].shift) arr2Seat.shift = arr1[arr1Index].shift;
    for (let j = 0; j < seatLength; j++) {
      const seat = seats[j];

      if (arr1[arr1Index]) {
        if (arr1[arr1Index].seats[j]) {
          seat.id = arr1[arr1Index].seats[j].id;
          seat.invalid = arr1[arr1Index].seats[j].invalid;
         
          if (!arr1[arr1Index].seats[j].number) {
            seat.number = null;
          } else if (arr1[arr1Index].seats[j].editedNumber) {
            if(rowDir == '91' && arr1.length != arr2Length) {
              if(arr1.length < arr2Length && arr2Next) {
                arr2Next.seats[j].editedNumber = arr1[arr1Index].seats[j].editedNumber
              arr2Next.seats[j].number = arr1[arr1Index].seats[j].editedNumber
              } else if (arr1.length > arr2Length && arr2Prev) {
                arr2Prev.seats[j].editedNumber = arr1[arr1Index].seats[j].editedNumber
                arr2Prev.seats[j].number = arr1[arr1Index].seats[j].editedNumber
              }
            } else {
              arr2Seat.seats[j].editedNumber = arr1[arr1Index].seats[j].editedNumber
              seat.number = arr1[arr1Index].seats[j].editedNumber 
            }
          }
        }

      }
    }
   
    mergedArray.push(arr2Seat);
  }

  return mergedArray;
};


//edit functions
let spaceChangeDelay = null;
let rowCountChangeDelay = null;

export const changeSectionName = (id, configs) => {
  const currentGroup = mainGroups.get(id);
  const { name } = configs;
  const findName = currentGroup.children.find(g => g.attrs.type === 'name');

  findName.text(name);
  findName.setAttrs({
    offsetX: findName.width() / 2
  })

  const updateConfigs = { ...currentGroup.attrs.configs, name: name }
  currentGroup.setAttrs({ configs: updateConfigs });
};

export const fixSectionPosition = (section, seatsBound, left, right, maxTop) => {
  const rotation = section.rotation();
  const { rows, seats, seatSpacing, skewValue, rowSpacing, curveValue } = section.attrs.configs;
  if(rotation) {
    section.rotation(0);
  }

  const sectionNewSize = seatsBound.getClientRect();
  const sectionWidth = (SEAT.size + 5 + 2 * seatSpacing) * seats - 2 * seatSpacing - 5;
  
  const sectionName = section.children.find((g) => g.attrs.type === "name"); 
  const layerborder = section.children.find((g) => g.attrs.type === "border");
  const coverLayer = section.children.find((g) => g.attrs.type === "cover");
  const appStage = new AppStage();

  const curveSize = left && left.children.length > 0 ? left.children[0].attrs.y - 20 : 0;

  const skewSize = skewValue < 0 ? skewValue * 3 * (seats - 1) : 0;
  const shiftY = curveSize && curveSize < 0 ? curveSize  : 0;
  const specialShift = skewValue != 0 && curveValue > 0 ? maxTop - skewSize  : 0;
 
  seatsBound.setAttrs({
    offsetX: sectionWidth / 2, 
    offsetY: sectionNewSize.height / appStage.scaleX()  / 2,
    y: -shiftY - skewSize - Math.abs(specialShift)
  });
  
  if(sectionName) {
     sectionName.setAttrs({ 
      y: 0 - sectionNewSize.height/ appStage.scaleX() / 2 - 20 ,
    });
  }
  
  if(left) {
    left.setAttrs({
      x: -sectionWidth / 2 - 22,
      y: -seatsBound.offsetY() - shiftY - skewSize - Math.abs(specialShift) - 5
    });
  }
  
  if(right) {
    right.setAttrs({
      x: sectionWidth / 2 + 22 ,
      y: -seatsBound.offsetY() - shiftY - skewSize - Math.abs(specialShift) - 5
    });
  }
   
  if(layerborder) {
    layerborder.setAttrs({
      width: sectionWidth  + 10,
      height: sectionNewSize.height/ appStage.scaleX() + 10,
      offsetX: sectionWidth  / 2,
      offsetY: sectionNewSize.height / appStage.scaleX()  / 2 ,
      x: -5, 
      y: -5,
    });
  }
 
  if(coverLayer) {
    coverLayer.setAttrs({
      width: sectionNewSize.width/ appStage.scaleX(),
      height: sectionNewSize.height/ appStage.scaleX(),
      offsetX: sectionNewSize.width  / appStage.scaleX() / 2,
      offsetY: sectionNewSize.height / appStage.scaleX()  / 2,
    })
  }
  
  if(rotation) {
    section.rotation(rotation);
  }
}

export const changeSeatsDirection = (id, configs) => {
  const { rows, seats, seatDirection, seatSortType, seatStartsWith } = configs;
  const currentGroup = mainGroups.get(id);
  const currentSeats = seatsGroups.get(id);
  const confs = currentGroup.attrs.configs;
  const { seatsBind } = currentGroup;
  const newSeatsBind = cloneDeep(seatsBind);
  // const firstRow = currentGroup.seatsBind[0];
  // const reverse = flipObject(firstRow);

  for(let i = 0; i < rows; i++) {
    if(seatDirection === '19') {
      for(let j = 0; j < seats; j++) {
        const seatText = bindRows(j, seatSortType, seatStartsWith, configs, 'seat');

        newSeatsBind[i].seats[j].number = seatText.text;

        if(!newSeatsBind[i].seats[j].invalid) {
          currentSeats.children[i * seats + j].children[1].setAttrs({text: seatText.text})
        }
      }
    } else {
      for(let j = seats - 1; j >= 0; j--) {
        const seatText = bindRows(j, seatSortType, seatStartsWith, configs, 'seat');
        newSeatsBind[i].seats[seats - j - 1].number = seatText.text;

        if(!newSeatsBind[i].seats[seats - j - 1].invalid) {
          currentSeats.children[(i + 1) * seats - j - 1].children[1].setAttrs({text: seatText.text});
        }
      }
    }
  }

   currentGroup.setAttrs({ configs: { ...confs, seatDirection } });
}

export const changeRowsDirection = (id, configs) => {
  const { rowDirection, rowSpacing } = configs;
  const currentGroup = mainGroups.get(id);
  const currentSeats = seatsGroups.get(id);
  const rowsLength = currentGroup.attrs.seatsBind.length;
  const leftLabels = currentGroup.children.find((g) => g.attrs.type === "left");
  const rightLabels = currentGroup.children.find((g) => g.attrs.type === "right");
  const confs = currentGroup.attrs.configs;

  currentSeats.children.forEach((item) => {
    const rowIndex = rowDirection === "19" ? item.attrs.pos[0] : rowsLength - item.attrs.pos[0] - 1;
    const seatY =  (SEAT.size + 5 + rowSpacing * 2) * rowIndex;

    item.setAttrs({
      y: seatY
    });
  })

  leftLabels.children.forEach((item, index) => {
    const rowIndex = rowDirection === "19" ? index : rowsLength - index - 1;
    const seatY =  (SEAT.size + 5 + rowSpacing * 2) * rowIndex - currentSeats.getClientRect().height / 2 + SEAT.size/ 2;

    item.setAttrs({ y: seatY });

    rightLabels.children[index].setAttrs({
      y: seatY
    });
  });

  currentGroup.setAttrs({ configs: { ...confs, rowDirection } });
}

