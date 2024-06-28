import Konva from "konva";
import { uid } from "uid";
import _, { cloneDeep } from "lodash";
import { isEmptySeats } from "../utilsEdit";
import { TextParams, SEAT } from "../Constants";
import { AppStage } from "@/core/AppStage";
import { mainGroups } from "@/core/MainGroups";
import { seatsGroups } from "@/core/SeatsGroup";
import { hoverGroup, selectGroup, deselectGroup, ActionButtonsGroup, dragGroups } from "../utils";
import { createSeat, emptySeat, selectSeats, deleteSeat, updateSeat, shiftRows } from "../seatUtils";

import {
  bindRowsAndSeats,
  generateRowGroup,
  drawSeatGroupBorder,
  flipObject,
  mergeArrays,
  fixSectionPosition,
} from "./_utils";

import { updateSectionLayout } from "../builderSetup";

const seatSize = SEAT.size;
let seatRadius = 20;
let borderLayer = {};
let rowLabelGroups = {};
let builder;
let cloneSections = {};
let curveDelay = {};
let skewDelay = {};
let resetShift = false;

export const generateSection = (
  seatsBind,
  configs,
  component,
  position,
  groupId
) => {
  const appStage = new AppStage();
  builder = component;

  const {
    name,
    rows,
    seatSpacing,
    rowSpacing,
    seatDirection,
    rowDirection,
    curveValue,
    skewValue,
    rotation,
    seats,
    alignment,
    // rowSortType,
    hideTitle
  } = configs;
  let rowDir;
  let seatDir;
  if (groupId) {
    rowDir = rowDirection;
    seatDir = seatDirection;
  }
  
  const draggable = configs.draggable !== undefined ? configs.draggable : true;
  let mainGroup = new Konva.Group({
    name,
    draggable: draggable,
    rotation: 0,
    type: "section",
    seatsBind,
    configs,

  });

  mainGroup.seatsBind = seatsBind;
  
  if (groupId) {
    mainGroup.setAttrs({
      id: groupId,
      rowDir,
      seatDir,
    });

    if (rowDir) {
      mainGroup.rowDir = rowDir;
      mainGroup.seatDir = seatDir;
    }
  } else {
    mainGroup.setAttrs({
      id: uid(6),
      rowDir: "91",
      seatDir: "19",
    });

    mainGroup.rowDir = "91";
    mainGroup.seatDir = "19";
  }
 
  const id = mainGroup.attrs.id;
  let seatsGroup = new Konva.Group({
    group: "seatGroup",
    type: "seatGroup",
  });
  
  let rowLabelGroup = new Konva.Group({ isRow: true, type: "left" });

  rowLabelGroup.isRow = true;
  let rowLabelX = 0;
  let rowLabelY = (seatRadius * 2 * rows) / 2 - 10; // position row label in the center of the section
  const sectionWidth = (seatSize + 5 + 2 * seatSpacing) * seats - 2 * seatSpacing - 5;
  const sectionHeight = (seatSize + 5 + 2 * rowSpacing) * rows - 2 * rowSpacing - 5;
  
  
  for (let index = 0; index < seatsBind.length; index++) {
    const eachRowSeats = seatsBind[index].seats;
    let leftEmpty = 0;
    let rightEmpty = 0;

    if (
      eachRowSeats[0].number &&
      eachRowSeats[eachRowSeats.length - 1].number
    ) {
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

    if(resetShift) {
      seatsBind[index].shift = 0;
    } 
    seatsBind[index].leftEmpty = leftEmpty;
    seatsBind[index].rightEmpty = rightEmpty;

    const centerShift = (leftEmpty != 0 || rightEmpty != 0) && alignment === 'center' ? (rightEmpty - leftEmpty) / 2 * (seatSize + 5 + 2 * seatSpacing) : 0;
    const shift = seatsBind[index].shift ? seatsBind[index].shift : 0;
    
    const key = seatsBind[index].key;
    const RowUid = seatsBind[index].id;
    const seatY = (seatSize + 5 + rowSpacing * 2) * index ;
    const rowLabelOptions = generateRowGroup(
      index,
      key,
      rowLabelX,
      rowLabelY,
      seatRadius,
      rowSpacing,
      seatSpacing
    );


    let rowLabel = new Konva.Text({ ...rowLabelOptions, id: RowUid });

    rowLabel.id = RowUid;
    rowLabelGroup.setAttrs({ 
      rowId: RowUid,
    });

    rowLabelGroup.add(rowLabel);
    rowLabel.setAttrs({
      offsetX: 22,
      offsetY: seatSize / 2,
      width: 44,
      height: seatSize,
      verticalAlign: 'middle',
      align: 'center',
      y: seatY + seatSize / 2
    })
    
    for (let i = 0; i < seatsBind[index].seats.length; i++) {
      const seatItems = seatsBind[index].seats[i];
      // seatItems.id = uid(6);
      let seatWithNumGroup = new Konva.Group({
        id: seatItems.id,
        rowId: RowUid,
        row: rowLabel.attrs.text,
        number: seatItems.number,
        invalid: seatItems.invalid,
        deleted: !(seatItems.number || seatItems.number === 0)
      });

      const curveSize = seatsBind[0].seats[i].curveSize ? seatsBind[0].seats[i].curveSize : 0; 
      const skewSize = seatsBind[0].seats[i].skewSize ? seatsBind[0].seats[i].skewSize : 0;

      const gapY = Math.abs(curveValue * seats / 5) > Math.abs(skewValue * seats / 5) ? Math.abs(curveValue * seats / 5) : Math.abs(skewValue * seats / 5)
   
      const seatX = (seatSize + 5 + seatSpacing * 2) * i + shift + centerShift;
      
      const listening = seatX >= -(seatSize + 5) && seatX <=  sectionWidth;
      const offsetX = listening ? 0 : seatX  < 0 ? sectionWidth / 2 : - sectionWidth / 2;
      const { seat, seatNumber } = createSeat(0, 0, seatItems.number, seatItems.invalid, seatWithNumGroup)

      seatWithNumGroup.rowId = RowUid;
      seatWithNumGroup.row = rowLabel.attrs.text;
      seatWithNumGroup.number = seatItems.number;
      seatWithNumGroup.invalid = seatItems.invalid;
      seatWithNumGroup.setAttrs({
        x: seatX,
        y: seatY,
        pos: [index, i],
        listening: listening,
        offsetX: -offsetX,
      })

      if(index == 0) {
        seatWithNumGroup.setAttrs({
          curveSize: curveSize,
          skewSize: skewSize
        })
      }

      if(i == 0) {
        seatWithNumGroup.setAttrs({
          leftEmpty: leftEmpty
        })
      } else if (i == seatsBind[index].seats.length - 1) {
        seatWithNumGroup.setAttrs({
          rightEmpty: rightEmpty
        })
      }

      if (!seatItems.number && seatItems.number !== 0) {
        emptySeat(seat, seatNumber, seatWithNumGroup, i, alignment);

      }

      seatsGroup.add(seatWithNumGroup);
    }
  }

  seatsGroups.add(seatsGroup, id);
  rowLabelGroups[id] = rowLabelGroup.y();
  rowLabelGroup.type = "left";
  mainGroups.add(mainGroup, id);
  const currentGroup = mainGroups.get(id);
  const currentSeats = seatsGroups.get(id);
  mainGroup.add(currentSeats, rowLabelGroup); //

  const seatsGroupBound =currentSeats.getClientRect();
  
  const seatGroupOffset = {
    offsetX: sectionWidth / 2,
    offsetY: seatsGroupBound.height / 2,
  };

  currentSeats.setAttrs({
    ...seatGroupOffset,
  });

  const cloneRowRight = rowLabelGroup.clone();

  cloneRowRight.setAttrs({
    type: "right",
    isRow: true,
  });

  

  cloneRowRight.type = "right";
  cloneRowRight.isRow = true;

  mainGroup.add(cloneRowRight);


  rowLabelGroup.setAttrs({
    x: -sectionWidth / 2 - 22,
    y: -sectionHeight / 2
  });

  cloneRowRight.setAttrs({
    x: sectionWidth / 2 + 22,
    y: -sectionHeight / 2
  });
  

  const { layerBorder, coverLayer } = drawSeatGroupBorder(
    seatsGroupBound,
    currentGroup,
    seats,
    seatSpacing
  );

  borderLayer[id] = layerBorder;

  mainGroup.add(borderLayer[id], coverLayer);

  borderLayer[id].visible(false)
 
  let tableName = new Konva.Text({
    text: name,
    fontSize: TextParams.SIZE_XL,
    fontFamily: "Lato-Regular",
    fill: "white",
    align: TextParams.ALIGN_CENTER,
    verticalAlign: "middle",
    type: "name",
  });

  mainGroup.add(tableName);

  if (hideTitle === true) tableName.visible(false);

  tableName.setAttrs({
    offsetX: tableName.width() / 2,
    offsetY: tableName.height() / 2,
    y: 0 - sectionHeight / 2 - 20,
  });

  if (position) {
    mainGroup.position(position);
  } else {
    const scale = appStage.scale();
    const mainGroupPos = mainGroup.getClientRect();

    mainGroup.position({
      x: (((-appStage.x() + appStage.width() / 2) / scale.x)),
      y: ((-appStage.y() / scale.y + (mainGroupPos.height / 2))) + 20,
    });
  }

  if (!configs.label_left) {
    rowLabelGroup.visible(false);
  }

  if (!configs.label_right) {
    cloneRowRight.visible(false);
  }

  const seatsBound = currentSeats.getClientRect();

  borderLayer[id].setAttrs({
    width: sectionWidth + 10,
    height: sectionHeight + 10,
    offsetX: sectionWidth / 2 ,
    offsetY: sectionHeight / 2 ,
    x: -5,
    y: -5
  });

  coverLayer.setAttrs({
    width: sectionWidth ,
    height: sectionHeight ,
    offsetX: sectionWidth / 2 ,
    offsetY: sectionHeight / 2 ,
  });

  // fixSectionPosition(currentGroup, currentSeats, rowLabelGroup, cloneRowRight);

  if ("curveValue" in configs && curveValue !== null && curveValue != 0) {
    // mainGroup.visible(false);
    curveSection(curveValue, id, configs);
  }
   
  if ("skewValue" in configs && skewValue !== null && skewValue != 0) {
    // mainGroup.visible(false);
    skewSection(skewValue, id, configs);
  }
   
  if ("rotation" in configs && rotation !== null)
    rotateSection(rotation, id, configs);


  hoverGroup(currentGroup, borderLayer, id); //hover section

  selectGroup(currentGroup, id, component); //select/deselet section

  dragGroups(currentGroup, appStage);

  resetShift = false;

  return { mainGroup };
};

const getRemoveds = (seatsBind) => {
  let leftEmpty = 0;
  let rightEmpty = 0;
  const eachRowSeats = seatsBind.seats;

  if (
    eachRowSeats[0].number &&
    eachRowSeats[eachRowSeats.length - 1].number
  ) {

  } else {
    for (let j = 0; j < eachRowSeats.length; j++) {
      const seat = eachRowSeats[j];
      if (seat.number) {
        break;
      } else if (!seat.number) {
        leftEmpty++;
        if(leftEmpty > 1) {
          eachRowSeats[j-1].setAttrs({
            extra: true
          });
        }
      }
    }

    for (let j = eachRowSeats.length - 1; j >= 0; j--) {
      const seat = eachRowSeats[j];
      if (seat.number) {
        break;
      } else if (!seat.number) {
        rightEmpty++;
        if(rightEmpty > 1) {
          eachRowSeats[j+1].setAttrs({
            extra: true
          });
        }
      }
    }
  }

  return { leftEmpty, rightEmpty }
}

export const deleteElement = (id, component) => {
  component.deleteConfirmation(id, "section");
};

export const deleteSection = (id) => {
  const currentGroup = mainGroups.get(id);
  currentGroup.destroy();
};

export const updateSection = (id, configs, alignment) => {
  let currentGroup = mainGroups.get(id);
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const position = currentGroup.position();
  const { rowSeatData } = bindRowsAndSeats(configs);
  const { seatsBind } = currentGroup;
  const mergedArr = mergeArrays(seatsBind, rowSeatData, configs.rowDirection);
  const isEmpty = isEmptySeats.section(mergedArr);

  if (isEmpty) {
    return false;
  }

  if(alignment) {
    resetShift = true;
  }

  currentGroup.destroy();
  mainGroups.remove(id);

  const { mainGroup } = generateSection(
    mergedArr,
    configs,
    builder,
    position,
    id
  );

  mainLayer.add(mainGroup);
  mainGroups.add(mainGroup, id);
  currentGroup = mainGroups.get(id);

  selectSeats(id, builder, configs);
  currentGroup.setAttrs({ configs });
  
  if(configs.editDrag) {
    currentGroup.setAttrs({ draggable: false });
  }

  
};

export const cancelChanges = (configs) => {
  const { layerId } = configs;
  const cloneData = cloneSections[layerId];
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const currentGroup = mainGroups.get(layerId);
  const position = currentGroup.position();

  currentGroup.destroy();

  const { mainGroup } = generateSection(
    cloneData,
    configs,
    builder,
    position,
    layerId
  );

  mainLayer.add(mainGroup);

  deselectGroup();
};

export const deleteSectionSeat = (payload) => {
  const { layerId, rowId } = payload.seatData; // configs,
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const currentGroup = mainGroups.get(layerId);
  const { seatsBind } = currentGroup;
  const position = currentGroup.position();
  const { configs } = currentGroup.attrs;
  const changedSeatsBind = deleteSeat(seatsBind, payload);

  currentGroup.destroy();

  const { mainGroup } = generateSection(
    changedSeatsBind,
    configs,
    builder,
    position,
    layerId
  );

  mainLayer.add(mainGroup);
  selectSeats(layerId, builder, configs);
  currentGroup.setAttrs({ configs });
};

export const editSectionSeat = (payload) => {
  const { layerId } = payload.seatData;
  const currentGroup = mainGroups.get(layerId);
  const seatsBind = currentGroup.seatsBind;
  updateSeat(seatsBind, payload);
};



export const curveSection = (curveValue, id) => {
  let maxTop = Infinity;
  const currentGroup = mainGroups.get(id); 
  const currentSeats = seatsGroups.get(id);
  const allSeats = currentSeats.children;
  const { configs, seatsBind } = currentGroup.attrs;
  const { seats, seatSpacing, rowSpacing, skewValue } = configs;
  const seatWidtharea = (seatSize + 5 + seatSpacing * 2);
  const seatHeightArea = (seats * (seatSize + 5 + rowSpacing * 2) - rowSpacing * 2) / seats;
  const gapY = Math.abs(curveValue * seats / 5) > Math.abs(skewValue * seats / 5) ? Math.abs(curveValue * seats / 5) : Math.abs(skewValue * seats / 5)
  const center = seats * (seatWidtharea) / 2 ;
 
  if(curveDelay[id]) {
    clearTimeout(curveDelay[id]);
    curveDelay[id] = null;
  }
  
  curveDelay[id] = setTimeout(() => {
    
    const leftLabels = currentGroup.children.find((g) => g.attrs.type === "left");
    const rightLabels = currentGroup.children.find((g) => g.attrs.type === "right");

    const curveCoeff = (seats- 1) / 2 ;
    const labelCurve = Math.round((curveValue * curveCoeff * curveCoeff * 1.2) / Math.PI);
    const labelSkew = skewValue * 3 * (seats - 1);
    
    allSeats.forEach((item, index) => {
      const itemX = item.x();
      const row = Math.floor(index / seats)
     
      const itemDefY = (seatHeightArea + gapY) * row; 
      
      const idx = index - row * seats;
      let coeff = (Math.abs(itemX + 20 - center) / seatWidtharea)

      let curveSize = Math.round((curveValue * coeff * coeff * 1.2) / Math.PI) ;
      let skewSize = item.attrs.skewSize ? item.attrs.skewSize : 0;

      item.setAttrs({
        y: curveSize + itemDefY + skewSize,
      });

      item.setAttrs({
        curveSize: curveSize
      });
      
      if(leftLabels) {
        const leftTopY = row * (SEAT.size + 5 + 2 * rowSpacing + gapY) + (SEAT.size + 5) / 2  + labelCurve;
        leftLabels.children[row].setAttrs({
          y: leftTopY,
        });
      };
      
      if(rightLabels) {
        const rightTopY = row * (SEAT.size + 5 + 2 * rowSpacing + gapY) + (SEAT.size + 5) / 2 + labelCurve + labelSkew;
        rightLabels.children[row].setAttrs({
          y: rightTopY
        });
      }

      if(index < seats - 1) {
        maxTop = maxTop < curveSize + itemDefY + skewSize ? maxTop : curveSize + itemDefY + skewSize;
      }

    })
   
    const confs = currentGroup.attrs.configs;
    currentGroup.setAttrs({ configs: { ...confs, curveValue } });
    fixSectionPosition(currentGroup, currentSeats, leftLabels, rightLabels, maxTop);
  }, 0)
};

export const skewSection = (skewX, id, configs) => {
  let maxTop = Infinity;
  const currentGroup = mainGroups.get(id); 
  const currentSeats = seatsGroups.get(id);
  const allSeats = currentSeats.children;
  const { seats, seatSpacing, rowSpacing, curveValue } = configs;
  const { seatsBind } = currentGroup.attrs;
  const seatWidtharea = (seatSize + 5 + seatSpacing * 2);
  const gapY = Math.abs(curveValue * seats / 5) > Math.abs(skewX * seats / 5) ? Math.abs(curveValue * seats / 5) : Math.abs(skewX * seats / 5)
  const seatHeightArea = (seats * (seatSize + 5 + rowSpacing * 2 + gapY) - rowSpacing * 2) / seats;

  if(skewDelay[id]) {
    clearTimeout(skewDelay[id]);
    skewDelay[id] = null;
  }
  
  skewDelay[id] = setTimeout(() => {
   
    const leftLabels = currentGroup.children.find((g) => g.attrs.type === "left");
    const rightLabels = currentGroup.children.find((g) => g.attrs.type === "right");
    const curveCoeff = (seats - 1) / 2 ; 
    const labelCurve = Math.round((curveValue * curveCoeff * curveCoeff * 1.2) / Math.PI);
    const labelSkew = skewX * 3 * (seats - 1);
   
    allSeats.forEach((item, index) => {
      const itemX = item.x() / seatWidtharea * 3;
      const row = Math.floor(index / seats);
      const idx = index - row * seats;
     
      const itemDefY = (seatHeightArea) * Math.floor(index / seats) ;  
      let skewSize = Math.round(skewX * itemX)  ;
      let curveSize = item.attrs.curveSize ? item.attrs.curveSize : 0;
  
      item.setAttrs({
        y: skewSize + itemDefY + curveSize,
      });
  
      item.setAttrs({
        skewSize: skewSize 
      }); 

      if(index < seats - 1) {
        maxTop = maxTop < curveSize + itemDefY + skewSize ? maxTop : curveSize + itemDefY + skewSize;
      }

      if(leftLabels) {
        const leftTopY = row * (SEAT.size + 5 + 2 * rowSpacing + gapY) + (SEAT.size + 5) / 2  + labelCurve;
        leftLabels.children[row].setAttrs({
          y: leftTopY,
        });
      };
      
      if(rightLabels) {
        const rightTopY = row * (SEAT.size + 5 + 2 * rowSpacing + gapY) + (SEAT.size + 5) / 2 + labelCurve + labelSkew;
        rightLabels.children[row].setAttrs({
          y: rightTopY
        });
      }
     
    })
    
    const confs = currentGroup.attrs.configs;
  
    currentGroup.setAttrs({ configs: { ...confs, skewValue: skewX } });
    fixSectionPosition(currentGroup, currentSeats, leftLabels, rightLabels, maxTop);
  }, 0)
};

export const rotateSection = (rotation, id, configs) => {
  const currentGroup = mainGroups.get(id);
  const currentSeats = seatsGroups.get(id);
  currentGroup.rotation(rotation);
  let oppositeRotation = -rotation;

  let seats = currentSeats.getChildren();
  let groups = currentGroup.getChildren();
  const sectionName = groups.find((g) => g.attrs.type === "name");

  if (rotation > 90) sectionName.rotation(180);
  if (rotation < 90) sectionName.rotation(0);
  if (rotation < -90) sectionName.rotation(-180);

  groups.find((child) => {
    if (child.isRow) {
      for (let i = 0; i < child.children.length; i++) {
        const element = child.children[i];
        element.rotation(oppositeRotation);
      }
    }
  });

  for (let i = 0; i < seats.length; i++) {
    const element = seats[i].children[1];
    if(element) {
      element.rotation(oppositeRotation);
    }

  }

  configs = { ...configs, rotation };
  currentGroup.setAttrs({ configs });
};

export const showHideLabels = ({ label_left, label_right, layerId }) => {
  const currentGroup = mainGroups.get(layerId);

  currentGroup.find((node) => {
    if (node.isRow) {
      if (node.type === "right") {
        if (label_right) node.visible(true);
        else node.visible(false);
      } else if (node.type === "left") {
        if (label_left) node.visible(true);
        else node.visible(false);
      }
    }
  });

  const confs = currentGroup.attrs.configs;

  currentGroup.setAttrs({ configs: { ...confs, label_left, label_right } });
};

export const showHideTitle = ({ hideTitle, layerId }) => {
  const currentGroup = mainGroups.get(layerId);
  const confs = currentGroup.attrs.configs
  const text = currentGroup.children.find(g => g.attrs.type === "name")

  if (text) text.visible(!hideTitle)

  currentGroup.setAttrs({ configs: { ...confs, hideTitle } });

}

export const sectionActions = {
  editAction: (id, component, configs, stage) => {
    const currentGroup = mainGroups.get(id);
   
    cloneSections[id] = _.cloneDeep(currentGroup.seatsBind);
    AppStage.addKey('editing', id);

    const conf = currentGroup.attrs.configs;
    if(currentGroup.attrs.draggable === undefined || currentGroup.attrs.draggable === true) {
      currentGroup.setAttrs({
        draggable: false
      });
      conf.editDrag = true;
    }
   

    component.editSection(id, conf, currentGroup);

    selectSeats(id, component, conf);

    borderLayer[id].visible(false);
  },
  copyAction: (id, component, configs) => {
    const currentGroup = mainGroups.get(id);
    const appStage = new AppStage();
    const mainLayer = appStage.children[0];
    const { seatsBind } = currentGroup;
    const conf = currentGroup.attrs.configs;
    const updatedConf = {...conf, draggable: true};
    const { mainGroup } = generateSection(seatsBind, updatedConf, component);
    mainLayer.add(mainGroup);
    deselectGroup();
    borderLayer[id].visible(false);
  },
  sortAction: (id, component) => {
    const appStage = new AppStage();
    const currentGroup = mainGroups.get(id);
    const { configs } = currentGroup.attrs;
    currentGroup.seatDir = currentGroup.seatDir === "19" ? "91" : "19";
    configs.seatDirection = currentGroup.seatDir;
    const position = currentGroup.position();
    const flipedSeats = flipObject(
      currentGroup.seatsBind,
      configs.seatDirection
    );

    const newConfigs = { ...configs, skewValue: -configs.skewValue, rotation: -configs.rotation };

    const { mainGroup } = generateSection(
      flipedSeats,
      newConfigs,
      builder,
      position,
      id
    );

    updateSectionLayout(id, mainGroup);
    currentGroup.setAttrs({ newConfigs });
    AppStage.resetSelected();
    const actionsButtons = new ActionButtonsGroup();
    actionsButtons.hideActions();
    appStage.container().style.cursor = "default";
    borderLayer[id].visible(false);
  },

  deleteAction: (id, component) => {
    component.deleteConfirmation(id, "text");
  }
}
