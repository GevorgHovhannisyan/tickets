import { TextParams, SEAT } from "./Constants";
import {AppStage} from "@/core/AppStage";
import { mainGroups } from "@/core/MainGroups";
import { seatsGroups } from "@/core/SeatsGroup";
import { recoverSectionSeatNumber, fixSectionPosition } from "./section/_utils";
import { recoverTableSeatNumber } from "./table/utils";
import { skewSection, curveSection } from "./section/_generator";
import Konva from "konva";

let selectedSeats = [];
let selectedRows = [];
let fixDelay = null;

export const createSeat = (x, y, seatText, invalid, parent, rotation) => {
  const seatSize = SEAT.size;
 
  const showedText = seatText || seatText === 0 ? invalid ? "" : seatText : "+";

  const fontFamily = (seatText || seatText === 0) && invalid ? "icon" : "Lato-Regular";
  const fontSize = (seatText || seatText === 0) && invalid ? 24 : TextParams.SIZE_MD;
    const seat = new Konva.Rect({
      width: seatSize,
      height: seatSize,
      stroke: "white",
      strokeWidth: 1,
      x: x,
      y: y,
      // cornerRadius: seatSize
    });

    const seatNumber = new Konva.Text({
      align: "center",
      verticalAlign: "middle",
      x: x + seatSize / 2,
      y: y + seatSize / 2,
      text: showedText,
      fontSize: fontSize,
      fill: "white",
      fontFamily: fontFamily,
      width: seatSize,
      height: seatSize,
      offset: {
        x: seatSize / 2,
        y: seatSize / 2
      },
      rotation: rotation,
      type: 'text'
    });

    parent.add(seat);
    parent.add(seatNumber);

    return { seat, seatNumber }
}

export const selectSeats = (id, component, configs) => {
  const appStage = new AppStage();
  const currentGroup = mainGroups.get(id);
  const currentSeats = seatsGroups.get(id);
  const isSection = currentGroup.attrs.type === 'section';
  currentGroup.zIndex(3);
  currentSeats.moveToTop();
  const seatsLength = currentSeats.children.length;
  const seats = currentSeats.children;

    currentGroup.children.forEach((type) => {
      if(type.attrs.type === "left" || type.attrs.type === "right") {
        type.children.forEach(label => {

          label.on('click', () => {

            const rowId = label.attrs.id;

            if(appStage.shiftPressed) {
               seats.forEach(item => {
                if (item.rowId === rowId && (item.number || item.number === 0)) {
                  let [fillSeat, textNode] = item.children;
                  if (isSelected(item)) {
                    // Deselect seat
                    selectedSeats = selectedSeats.filter(selectedSeat => selectedSeat !== item);
                    selectedRows = selectedRows.filter(selectedSeat => selectedSeat !== rowId);
                    fillSeat.fill("none");
                    textNode.fill("white");
                  } else {
                    // Select seat

                    selectedSeats.push(item);
                    if (!selectedRows.includes(rowId)) {
                      selectedRows.push(rowId);
                    }
                    fillSeat.fill("white");
                    textNode.fill("black");
                  }
                }
              });
            } else {
              deselectSeats();
              seats.forEach(item => {
                  if (item.rowId === rowId && (item.number || item.number === 0)) {
                    let [fillSeat, textNode] = item.children;
                    selectedSeats.push(item)
                    fillSeat.fill("white");
                    textNode.fill("black");
                  }
              });
              selectedRows = [rowId];
            }

            component.selectSecSeat(id, selectedSeats, rowId, configs);
          });

          label.on("mouseover", () => {
            if(appStage.editing) appStage.container().style.cursor = "pointer";
          })

          label.on("mouseleave", () => {
            if(appStage.editing) appStage.container().style.cursor = "default";
          })
        })
      }
    })


  for (let i = 0; i < seatsLength; i++) {
    const seat = seats[i];
    seat.on("click", () => {
      let [fillSeat, textNode] = seat.children;
   
      if (
        (textNode instanceof Konva.Text && textNode.text() === "+") ||
        (textNode instanceof Konva.Image && textNode.attrs.text === "+")
      ) {
        if(isSection) {
          recoverSectionSeatNumber(seat, currentGroup.seatsBind, id, configs);
          // if(configs.alignment === "center") {
            selectedSeats = [];
            return false
          // }
        } else {
          recoverTableSeatNumber(seat, currentGroup.seatsBind, id, configs);
        }
      }
        if (appStage.shiftPressed) {
          if (isSelected(seat)) {
            // Deselect seat
            selectedSeats = selectedSeats.filter(selectedSeat => selectedSeat !== seat);
            selectedRows = selectedRows.filter(selectedSeat => selectedSeat !== seat.rowId);
            fillSeat.fill("none");
            textNode.fill("white");
          } else {
            // Select seat

            selectedSeats.push(seat);
            if (!selectedRows.includes(seat.rowId)) {
              selectedRows.push(seat.rowId);
            }
            fillSeat.fill("white");
            textNode.fill("black");
          }
        } else {
          if (selectedSeats.length) {
            for (let i = 0; i < selectedSeats.length; i++) {
              const seat = selectedSeats[i];
              let [prevFillSeat, prevTextNode] = seat.children;
              prevFillSeat.fill("none");
              prevTextNode.fill("white");
            }
          }
          selectedSeats = [seat];
          selectedRows = [seat.rowId];
          fillSeat.fill("white");
          textNode.fill("black");
        }
        if(isSection) {

          component.selectSecSeat(id, selectedSeats, seat.rowId, configs);
        } else {
          component.selectTableSeat(id, selectedSeats, configs);
        }
    });

    seat.on("mouseover", () => {
     if(appStage.editing) appStage.container().style.cursor = "pointer";
    })

    seat.on("mouseleave", () => {
     if(appStage.editing) appStage.container().style.cursor = "default";
    })
  }


  // layerSections[id].batchDraw();
};

export const deselectSeats = () => {
  if (selectedSeats.length) {
    for (let i = 0; i < selectedSeats.length; i++) {
      const seat = selectedSeats[i];
      let [prevFillSeat, prevTextNode] = seat.children;
      prevFillSeat.fill("none");
      prevTextNode.fill("white");
    }
    selectedSeats = [];
    selectedRows = [];
  }
}

export const deselectGroupSeats = (id) => {
  const currentGroup = mainGroups.get(id);
  const currentSeats = seatsGroups.get(id);
  currentGroup.zIndex(0);
  currentSeats.zIndex(0);
  const seatsLength = currentSeats.children.length;
  const seats = currentSeats.children;
  const conf = currentGroup.attrs.configs;
  for (let i = 0; i < seatsLength; i++) {
      seats[i].off('click');
      seats[i].off("mouseover");
  }
  selectedSeats = []; 
  selectedRows = [];

  if(conf.editDrag) {
    currentGroup.setAttrs({
      draggable: true
    });
    const updateConfigs = { ...conf, editDrag:false };
    currentGroup.setAttrs({ configs: updateConfigs });
  }
};

export const emptySeat = (seat, seatNumberText, seatWithNumGroup, index, alignment) => {

  seat.setAttrs({
    stroke: null,
    hitstrokeWidth: 0
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


export const deleteSeat = (seatsBindRoot, payload) => {
  const seatsBind = _.cloneDeep(seatsBindRoot);
  const { seat, layerId } = payload.seatData;
  const { newData } = payload;
  const currentGroup = mainGroups.get(layerId);
  const isSection = currentGroup.attrs.type === "section";
  const sameRows = isSection ? theSameRows(seat) : null;
  let findSeat;

  if (seat && seat.length) {
    for (let i = 0; i < seat.length; i++) {
      const seatt = seat[i];

      if(isSection) {
        let findRow = seatsBind.find((row) => row.id === seatt.attrs.rowId);
        if (sameRows) {
          findRow.key = newData.row;
        }
        findSeat = findRow.seats.find((seat) => seat.id === seatt.attrs.id);
      } else {
        findSeat = seatsBind.find((seat) => seat.id === seatt.attrs.id);
      }

      findSeat.number = null;
    }
  }

  selectedSeats = [];
  selectedRows = [];

  return seatsBind;
};

export const updateSeat = (seatsBind, payload) => {
  const { seat, layerId } = payload.seatData;
  const { newData } = payload;
  const currentGroup = mainGroups.get(layerId);
  const currentSeats = seatsGroups.get(layerId);
  const isSection = currentGroup.attrs.type === "section";
  const sameRows = isSection ? theSameRows(seat) : null;
  let findSeat;

  if (seat && seat.length) {
    if(isSection) {
      for (let i = 0; i < seat.length; i++) {
        const seatt = seat[i];
        const textBlock = seatt.children[1];
        let findRow = seatsBind.find((row) => row.id === seatt.attrs.rowId);

        if (sameRows && newData.row !== seatt.row) { 
          findRow.key = newData.row;
          findRow.editedKey = newData.row;
          
          currentGroup.find((node) => {

            if (node.isRow ) {
              const rowLabel = node.children.find((r) => r.attrs.id === seatt.attrs.rowId);
              rowLabel.setAttrs({
                text: newData.row
              });
       
            } else if(node instanceof Konva.Group && node.rowId === seatt.attrs.rowId) {
              node.row = newData.row;
              node.attrs.row = newData.row;
            }
          }); 

          if(fixDelay) {
            clearTimeout(fixDelay);
          }

          fixDelay = setTimeout(()=>{
            currentSeats.children.map(item => {
              if (item.rowId === seatt.attrs.rowId) {
                item.row = newData.row;
                return item;
              }
            });
          },300)
        }

        findSeat = findRow.seats.find((seat) => seat.id === seatt.attrs.id);

        if(seat.length === 1 && seat[0].number.toString() !== newData.seat.toString()) {
          findSeat.number = newData.seat;
          findSeat.editedNumber = newData.seat;
        }

        findSeat.invalid = newData.invalid;
        changeSeatText(textBlock, findSeat.number, findSeat.invalid);
      }
    } else {
      if (seat.length === 1) {
        const textBlock = seat[0].children[1];
        findSeat = seatsBind.find((seat) => seat.id === payload.seatData.seat[0].attrs.id);
        findSeat.number = newData.seat;
        findSeat.invalid = newData.invalid;
        changeSeatText(textBlock, findSeat.number, newData.invalid);
      } else if (seat.length > 1) {
        for (let i = 0; i < seat.length; i++) {
          const seatInfo = seat[i];
          const textBlock = seat[i].children[1];

          findSeat = seatsBind.find((seat) => seat.id === seatInfo.attrs.id);
          findSeat.invalid = newData.invalid;

          changeSeatText(textBlock, findSeat.number, newData.invalid);
        }
      }
    }
  }

  return seatsBind;
};

export const shiftRows = (shiftStep, payload) => {
  const { layerId } = payload.seatData;
  const currentGroup = mainGroups.get(layerId);
  const currentSeats = seatsGroups.get(layerId);
  const { configs } = currentGroup.attrs;
  const { curveValue, skewValue, alignment, seats, seatSpacing } = configs;
  const allSeats = currentSeats.children;
  const sectionWidth = (SEAT.size + 5 + 2 * seatSpacing) * seats - 2 * seatSpacing;
  const shiftSize = shiftStep * (SEAT.size + 5 + 2 * seatSpacing)
  if (skewValue) {
     skewSection(0, layerId, configs);
    //  currentGroup.visible(false)
  }

  if (curveValue) {
    curveSection(0, layerId, configs);
    //  currentGroup.visible(false)
  }

  let seatsData = currentGroup.seatsBind;
  
  seatsData.forEach((row, index) => {
   
    if (selectedRows.includes(row.id)) {
      let shift = row.shift ? row.shift : 0;
      let firstSeat = index * parseInt(seats);
      let lastSeat = firstSeat + parseInt(seats);
      const leftEmpty = row.leftEmpty ? row.leftEmpty : 0;
      const rightEmpty = row.rightEmpty ? row.rightEmpty : 0;
      const leftMaxShift = alignment === "center" ? -(leftEmpty + rightEmpty) * (SEAT.size + 5 + 2 * seatSpacing) / 2 : -leftEmpty * (SEAT.size + 5 + 2 * seatSpacing);
      const rightMaxShift = alignment === "center" ? (leftEmpty + rightEmpty) * (SEAT.size + 5 + 2 * seatSpacing) / 2 : rightEmpty * (SEAT.size + 5 + 2 * seatSpacing); 
     
      if(shiftSize < 0 && shift <= leftMaxShift || shiftSize > 0 && shift >= rightMaxShift) {
        return false
      } else {
        shift += shiftSize;
        row.shift = shift;
        for(let i = firstSeat; i < lastSeat; i++) {
          allSeats[i].move({
            x: shiftSize,
          });
       
          if(allSeats[i].attrs.x < -44 || allSeats[i].attrs.x > sectionWidth) {
            allSeats[i].setAttrs({
              offsetX: shift,
              listening: false
            })
          } else {
            allSeats[i].setAttrs({
              offsetX: 0,
              listening: true
            })
          }
        }
      } 
    }
  })

  currentGroup.setAttrs({
    seatsBind: seatsData,
  })

  if (skewValue) {
    skewSection(skewValue, layerId, configs);
    setTimeout(()=>{
      currentGroup.visible(true)
    },0)

  }

  if (curveValue) {
    curveSection(curveValue, layerId, configs);
    setTimeout(()=>{
      currentGroup.visible(true)
    },0)
  }
}

const changeSeatText = (element, text, invalid) => {
  if(element) {
    if(invalid) {
      element.setAttrs({
        text: "",
        fontFamily: "icon",
        fontSize: 24,
      })
    } else {
      element.setAttrs({
        text: text,
        fontFamily: "Lato-Regular",
        fontSize: 14,
      })
    }
  }
}

const isSelected = (seat) => {
  return selectedSeats.includes(seat);
}

const theSameRows = (seats) => {
  let ids = [];

  if (seats && seats.length) {
    ids = seats.map(s => s.attrs.rowId);
  }

  const id_array = [... new Set(ids)]

  return id_array.length === 1;
}

