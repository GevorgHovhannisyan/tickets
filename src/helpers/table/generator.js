import Konva from "konva";
import { uid } from "uid";
import _ from "lodash";
import { appendTableToList } from "../builderSetup";
import { isEmptySeats } from "../utilsEdit";
import { TextParams } from "../Constants";
import { hoverGroup, selectGroup, deselectGroup, dragGroups } from "../utils";
import { AppStage } from "@/core/AppStage";
import { mainGroups } from "@/core/MainGroups";
import { seatsGroups } from "@/core/SeatsGroup";
import { selectSeats } from "../seatUtils";

import {
  roundTableBind,
  rectangleTableBind,
  mergeArrays,
  squareTableBind,
} from "./utils";

import {
  deleteSeat,
  updateSeat
} from '../seatUtils'

let builder;
let borderLayer = {};
let cloneTables = {};

export const createTable = (
  seatsBind,
  configs,
  component,
  tableId,
  position
) => {
  const appStage = new AppStage();
  const { seats, name, type, rotation, hideTitle } = configs;
  builder = component;
  const id = tableId ? tableId : uid(6);

  const draggable = configs.draggable !== undefined ? configs.draggable : true;

  let mainGroup = new Konva.Group({
    name,
    id,
    draggable: draggable,
    rotation: 0,
  });

  mainGroup.setAttrs({
    type,
    configs,
    seatsBind,
  });

  // for set actions position
  const borderOptions = {
    strokeWidth: 1,
    stroke: "gray",
    dash: [5, 5],
    type: "border",
    visible: false
  }

  let layerBorder;

  if (type === "round") {
    const { roundTableGroup, mainSeatGroup } = roundTableBind(
      seats,
      seatsBind,
      name,
    );
    
    mainSeatGroup.setAttrs({ group: "seatGroup" });

    seatsGroups.add(mainSeatGroup, id);
    mainGroup.add(roundTableGroup);

    layerBorder = new Konva.Circle();

    mainGroup.seatsBind = seatsBind;
   
  } else if (type === "rectangle") {
    const { rectangleTableGroup, seatGroup, rect } = rectangleTableBind(
      seatsBind,
      name,
    );

    seatGroup.setAttrs({ group: "seatGroup" });

    seatsGroups.add(seatGroup, id);

    mainGroup.add(rectangleTableGroup);
    const tableBound = rectangleTableGroup.getClientRect();

    layerBorder = new Konva.Rect({
      offsetX: tableBound.width / 2,
      offsetY: tableBound.height / 2,
      x: -10,
      y: -10,
    });

    mainGroup.seatsBind = seatsBind;

  } else if (type === "square") {
    const { squareTableGroup, seatsGroup, square } = squareTableBind(
      seatsBind,
      appStage,
    );

    mainGroup.add(squareTableGroup);
    squareTableGroup.add(seatsGroup);
    mainGroup.seatsBind = seatsBind;
    const tableBound = squareTableGroup.getClientRect();

    layerBorder = new Konva.Rect({
      offsetX: tableBound.width / 2,
      offsetY: tableBound.height / 2,
      x: -10,
      y: -10,
    });

    seatsGroup.setAttrs({ group: "seatGroup" });
    seatsGroups.add(seatsGroup, id);
  }

  let tableName = new Konva.Text({
    text: configs.upperCase ? name.toUpperCase() : name,
    fill: "white",
    align: TextParams.ALIGN_CENTER,
    verticalAlign: "middle",
    type: "name",
    fontFamily: !configs.bold ? TextParams.FONT_REGULAR : TextParams.FONT_BOLD,
    fontSize: configs.fontSize ? configs.fontSize : TextParams.SIZE_XL,
    lineHeight: configs.lineHeight,
    letterSpacing: configs.spacing,
  });

  mainGroup.add(tableName);
  mainGroup.add(layerBorder);
  const seatsGroupBound = mainGroup.getClientRect();

  tableName.setAttrs({

    offsetX: tableName.width() / 2,
    offsetY: tableName.height() / 2,

  });

  if(hideTitle === true) tableName.visible(false);

  layerBorder.setAttrs({
    ...borderOptions,
    width: seatsGroupBound.width + 20,
    height: seatsGroupBound.height + 20,
  });

  borderLayer[id] = layerBorder;
  mainGroups.add(mainGroup, id);
  const currentGroup = mainGroups.get(id);

  if (configs.rotation && rotation !== null)
      rotateTable(rotation, id, configs);

  if (position) {
    mainGroup.setAttrs({
      x: position.x,
      y: position.y,
      offsetX: mainGroup.width() / 2,
      offsetY: mainGroup.height() / 2,
    });
  } else {
    const scale = appStage.scale();

    mainGroup.position({
      x: (((-appStage.x() + appStage.width() / 2) / scale.x)),
      y: (((-appStage.y() + 40) / scale.y + (seatsGroupBound.height / 2))),
    });
  }

  hoverGroup(currentGroup, borderLayer, id); //hover this table

  selectGroup(currentGroup, id, component); //select/unselect this table

  dragGroups(currentGroup, appStage)
  
  return { mainGroup };
};

export const tableActions = {
  editAction: (id, component, configs) => {
    const currentGroup = mainGroups.get(id);
    cloneTables[id] = _.cloneDeep(currentGroup.seatsBind);
    AppStage.addKey('editing', id);
    const conf = currentGroup.attrs.configs;

    if(currentGroup.attrs.draggable === undefined || currentGroup.attrs.draggable === true) {
      currentGroup.setAttrs({
        draggable: false
      });
      conf.editDrag = true;
    }
    
    component.editTable(id, conf, currentGroup);

    selectSeats(id, component, conf);

    borderLayer[id].visible(false);
  },
  copyAction: (id, component, configs) => {
    const appStage = new AppStage();
    const mainLayer = appStage.children[0];
    const currentGroup = mainGroups.get(id);
    const conf = currentGroup.attrs.configs;
    const updatedConf = {...conf, draggable: true};
    const { seatsBind } = currentGroup;
    let newSeatsBind = seatsBind;
    for(let i = 0; i < newSeatsBind.length; i++) {
      newSeatsBind[i].id = uid(6);
    }

    const { mainGroup } = createTable(newSeatsBind, updatedConf, builder);
    mainLayer.add(mainGroup);

    appendTableToList(mainGroups);
    deselectGroup();
    borderLayer[id].visible(false);
  },
  deleteAction: (id, component) => {
    component.deleteConfirmation(id, "table");
  }
}

export const updateTableStage = (id, payload) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  let currentGroup = mainGroups.get(id);
  const position = currentGroup.position();
  const { type } = payload.tableData;
  
  const { seats, rotation, name, fontSize, lineHeight, spacing, bold, upperCase, draggable } = payload.newData;
  const { seatsBind } = currentGroup;
  const editDrag = payload.newData.editDrag;
  const conf = {
    name,
    type,
    seats,
    rotation,
    fontSize, 
    lineHeight,
    spacing,
    bold,
    upperCase,
    draggable
  };

  
  let bindSeats = seatsBind;
  let seatsLength = seats;
  const seatsBindNew = [];

  for (let i = 0; i < seatsLength; i++) {
    seatsBindNew.push({ id: uid(6), number: i + 1 });
  }

  const mergedArr = mergeArrays(seatsBind, seatsBindNew);
  const isEmpty = isEmptySeats.table(mergedArr);
  bindSeats = mergedArr;

  if (isEmpty) {
    return false;
  }

  currentGroup.destroy();
  const { mainGroup } = createTable(
    bindSeats,
    conf,
    builder,
    id,
    position
  );

  mainLayer.add(mainGroup);
  mainGroups.add(mainGroup, id);
  currentGroup = mainGroups.get(id);
  selectSeats(id, builder, conf);
 
  if(editDrag) {
    const updateConfigs = { ...conf, editDrag: true };
    currentGroup.setAttrs({ configs: updateConfigs });
    currentGroup.setAttrs({ draggable: false });
    
  }

};

export const editTableSeat = (payload) => {
  const { layerId } = payload.seatData;
  const currentGroup = mainGroups.get(layerId);
  const seatsBind = currentGroup.seatsBind;
  updateSeat(seatsBind, payload);
};

export const deleteTable = (id, component) => {
  component.deleteConfirmation(id, "table");
};

export const copyTable = (component, configs, id) => {
  const currentGroup = mainGroups.get(id);
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const { seatsBind, attrs } = currentGroup;
  const { mainGroup } = createTable(seatsBind, attrs.configs, builder);
  mainLayer.add(mainGroup);

  appendTableToList(mainGroups);
};


export const deleteTableSeat = (payload) => {

  const { layerId } = payload.seatData; // , configs
  let currentGroup = mainGroups.get(layerId);
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const { configs } =  currentGroup.attrs;
  const { seatsBind } =  currentGroup;
  const position =  currentGroup.position();
  const changedSeatsBind = deleteSeat(seatsBind, payload);

   currentGroup.destroy();
  // deselectTable(layerId)

  const { mainGroup } = createTable(
    changedSeatsBind,
    configs,
    builder,
    layerId,
    position
  );

  currentGroup = mainGroup;
  mainLayer.add(mainGroup);
  selectSeats(layerId, builder, configs);
};



export const cancelTableChanges = (configs) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const layerId = configs?.layerId;
  const currentGroup = mainGroups.get(layerId);
  const confs = currentGroup.attrs.configs;
  const cloneData = cloneTables[layerId];
  const position =currentGroup.position();
  currentGroup.destroy();

  const { mainGroup } = createTable(
    cloneData,
    configs,
    builder,
    layerId,
    position
  );

  mainLayer.add(mainGroup);

  deselectGroup();
};

export const rotateTable = (rotation, id, configs) => {
  const currentGroup = mainGroups.get(id);
  const currentSeats = seatsGroups.get(id)
  currentGroup.rotation(rotation);

  let oppositeRotation = -rotation;
  let seats = currentSeats.getChildren();
  let groupChild = currentGroup.getChildren();
  const tableName = groupChild.find((g) => g.attrs.type === "name");

  tableName.rotation(oppositeRotation);

  if(borderLayer[id].getClassName() === 'Circle') {
    borderLayer[id].rotation(oppositeRotation);
  }

  for (let i = 0; i < seats.length; i++) {
    const element = seats[i].children[1];
    let defRotation = currentGroup.attrs.type === 'round' ? i * 360 / seats.length + 90 : 0;
    element.rotation(oppositeRotation - defRotation);
  }

  configs = { ...configs, rotation };
  currentGroup.setAttrs({ configs });
};

export const deleteTableElement = (id) => {
  const currentGroup = mainGroups.get(id);
  currentGroup.destroy();
  deselectGroup();
};

export const showHideTitle = ({ hideTitle, layerId }) => {
  const currentGroup = mainGroups.get(layerId);
  const confs = currentGroup.attrs.configs;
  const text = currentGroup.children.find(g => g.attrs.type === "name");
  if (text) text.visible(!hideTitle);
  const updateConfigs = { ...confs, hideTitle: hideTitle };
  currentGroup.setAttrs({ configs: updateConfigs });
}
