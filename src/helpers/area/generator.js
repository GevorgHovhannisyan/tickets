import Konva from "konva";
import { uid } from "uid";
import { rotateAreaUtil, setAreaParams } from "./utils";
import { appendTableToList } from "../builderSetup";
import { hoverGroup, selectGroup, deselectGroup, destroyTransformer, dragGroups } from "../utils";
import { TextParams } from "../Constants";
import { AppStage } from "@/core/AppStage";
import { mainGroups } from "@/core/MainGroups";

let builder;
let rectGroups = {};
let cloneAreas = {};
let borderLayer = {};

export const generateArea = (
  configs,
  component,
  areaId,
  attrs,
  position
) => {
  const { name, seats, rotation, hideTitle } = configs;

  builder = component;
 
  const appStage = new AppStage();
  const scale = appStage.scaleX();
  const id = areaId ? areaId : uid(6);
  const draggable = configs.draggable !== undefined ? configs.draggable : true;
  let mainGroup = new Konva.Group({
    draggable: draggable,
    id,
    configs,
    type: "area",
    transforming: true
  });

  
  const currentConfs = mainGroup.attrs ? mainGroup.attrs.configs : null;

  const rectHeight = currentConfs && currentConfs.rectH ? currentConfs.rectH : 400
  const rectWidth = currentConfs && currentConfs.rectW ? currentConfs.rectW : 400

  let rectangle = new Konva.Shape({
    width: rectWidth,
    height: rectHeight,
    stroke: "gray", // Set the stroke color
    strokeWidth: 3,
    type: "rectangle"
  });

  //create layer for transforming
  let transformer = new Konva.Rect({
    width: rectHeight/scale,
    height: rectWidth/scale,
    type: "transform",
  })

  // let text = new Konva.Text({
  //   text: `Max (${seats})`,
  //   fontSize: 16,
  //   fontFamily: "Lato-Regular",
  //   fill: "white",
  //   type: "text",
  // });

  let nameArea = new Konva.Text({
    text: name,
    fontSize: TextParams.SIZE_XL,
    fontFamily: "Lato-Regular",
    fill: "white",
    align: TextParams.ALIGN_CENTER,
    verticalAlign: "middle",
    type: "area_name",
  });

  let layerBorder = new Konva.Shape({
    width: rectWidth / scale,
    height: rectHeight / scale,
    stroke: "gray", // Set the stroke color
    strokeWidth: 1, // Set the stroke width
    type: "border",
    x: 0,
    y: 0
  });

  borderLayer[id] = layerBorder;

  mainGroup.add(layerBorder);
  mainGroup.add(rectangle);
  mainGroup.add(transformer);
  // mainGroup.add(text);
  mainGroup.add(nameArea);
  mainGroups.add(mainGroup, id);
  rectGroups[id] = rectangle;
  const currentGroup = mainGroups.get(id);

  if(hideTitle) nameArea.visible(false);

  borderLayer[id].visible(false);

  mainGroup.setAttrs({
    width: rectWidth,
    height: rectHeight,
    offsetX: rectWidth / 2,
    offsetY: rectHeight / 2,
  });

  nameArea.setAttrs({
    offsetX: nameArea.width() / 2,
    offsetY: nameArea.height() / 2,
    x: rectWidth / 2 * scale,
    y: -nameArea.height(),
  });

  let startSize = 0;
  let startXDefence = 0;
  let startYDefence = 0;

  transformer.on("transformstart", () => {
    const currentConfigs = currentGroup.attrs.configs;
    const rotation = currentGroup.attrs.rotation;
    currentGroup.rotation(0);
    startSize = transformer.getClientRect();
    currentGroup.rotation(rotation);
    startXDefence = (startSize.width - currentConfigs.rectW * appStage.scaleX() );
    startYDefence = (startSize.height  - currentConfigs.rectH * appStage.scaleX());

  })

  transformer.on("transform", () => {
    resizeArea(id, transformer, [startSize, startXDefence, startYDefence], appStage);
  })

  transformer.on("transformend", () => {
    recountSize(id, transformer, appStage.scaleX(), appStage, configs)
  })

  if (position) {
    mainGroup.position(position);
  } else {
    const mainGroupPos = mainGroup.getClientRect();

    mainGroup.position({
      x: (((-appStage.x() + appStage.width() / 2) / scale)),
      y: (((-appStage.y() + 30) / scale + (mainGroupPos.height / 2) * scale)),
    });
  }

  setAreaParams(currentGroup, rectGroups[id], borderLayer[id], configs, scale);

  fixArea(id, configs);

  if ("rotation" in configs && rotation !== null) rotateTable(rotation, id, configs);

  hoverGroup(currentGroup, borderLayer, id); //hover area

  selectGroup(currentGroup, id, component); //select/deselet area

  dragGroups(currentGroup, appStage)

  // setNameTextPosotion(nameArea, transformer);

  const $builder = document.getElementById("venue-builder") ?
                  document.getElementById("venue-builder") :
                  document.getElementById("edit-venue-builder");

  $builder.addEventListener("wheel", function (e) {
      e.preventDefault(); // Prevent page scrolling
  })

  return { mainGroup};
};

export const deleteAreaElement = (id) => {
  const currentGroup = mainGroups.get(id);
  currentGroup.destroy();
  AppStage.resetSelected()
};

export const rotateTable = (rotation, id, configs) => {
  const currentGroup = mainGroups.get(id);
  currentGroup.setAttrs({ configs: { ...configs, rotation } });
  rotateAreaUtil(currentGroup, rotation, configs)
};

export const updateAreaStage = (id, payload) => {
  const { name, seats } = payload.newData;

  const currentGroup = mainGroups.get(id);
  const findName = currentGroup.children.find(g => g.attrs.type === 'area_name');
  // const findText = group.children.find(g => g.attrs.type === 'text');
  findName.text(name);
  // findText.text(`Max (${seats})`);

  const rotation = currentGroup.rotation();
  currentGroup.rotation(0);

  const updateConfigs = { ...currentGroup.attrs.configs, name: name, seats: seats };
  currentGroup.setAttrs({ configs: updateConfigs });
  findName.offsetX(findName.width() / 2);

  if (rotation) currentGroup.rotation(rotation);
};

export const modifyArea = (configs, id) => {
  const appStage = new AppStage();
  const currentGroup = mainGroups.get(id);
  setAreaParams(currentGroup, rectGroups[id], borderLayer[id], configs, appStage.scaleX());
}

export const fixArea = (id, configs, width, height, left, top) => {
  const currentGroup = mainGroups.get(id);
  const newX = left ? left : currentGroup.attrs.x;
  const newWidth = width ? width : rectGroups[id].attrs.width ;
  const newHeight = height ? height: rectGroups[id].attrs.height ;
  const shiftY = rectGroups[id].attrs.centerShift;
  const topShift = rectGroups[id].attrs.topShift;
  const oldShift = currentGroup.attrs.configs.shift ? currentGroup.attrs.configs.shift : 0;
  const newY = top ? top : currentGroup.attrs.y + shiftY - oldShift;

  currentGroup.setAttrs({
    width: newWidth,
    height: newHeight,
    offsetY: newHeight / 2,
    offsetX: newWidth / 2,
    y: newY,
    x: newX
  })

  rectGroups[id].setAttrs({
    height: newHeight,
    width: newWidth,
    x: 0,
    y: topShift,
    offsetX: 0,
    offsetY: 0,
  })

  borderLayer[id].setAttrs({
    width: newWidth + 20,
    height: newHeight + 20,
    y: topShift,
    x: 0,
    offsetX: 0,
    offsetY: 0,
  })

  const transformer = currentGroup.children.find(child => child.attrs.type === 'transform');
  const nameArea = currentGroup.children.find(child => child.attrs.type === 'area_name');

  transformer.setAttrs({
    width: newWidth,
    height: newHeight,
    y: 0,
    x: 0,
    scaleX: 1,
    scaleY: 1,
    offsetX: 0,

  })

  nameArea.setAttrs({
    y: -nameArea.height(),
    x: newWidth / 2
  });

  const updateConfigs = { ...currentGroup.attrs.configs, y: newY, shift: shiftY, width: newWidth, height: newHeight };
  currentGroup.setAttrs({ configs: updateConfigs });
}

export const cancelAreaChanges = (configs) => {
  const layerId = configs?.layerId;
  const attrs = rectGroups[layerId].getAttrs();

  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const currentGroup = mainGroups.get(layerId);

  const position = currentGroup.position();
  currentGroup.destroy();

  const { mainGroup } = generateArea(
    configs,
    builder,
    layerId,
    attrs,
    position
  );

  mainLayer.add(mainGroup);
  deselectGroup();
};

export const showHideTitle = ({ hideTitle, layerId }) => {
  const currentGroup = mainGroups.get(layerId);
  const confs = currentGroup.attrs.configs;
  const text = currentGroup.children.find(g => g.attrs.type === "area_name");
  if (text) text.visible(!hideTitle);
  const updateConfigs = { ...confs, hideTitle: hideTitle };
  currentGroup.setAttrs({ configs: updateConfigs });

}

// export const clearAreaBorders = () => {
//   if (Object.keys(mainGroups).length) {
//     for (const key in mainGroups) {
//       borderLayer[key].visible(false);
//     }
//   }
// }

//resize and reposition area and area elements after transform
const resizeArea = (id, transformer, start, stage) => {
  const scale = stage.scaleX();
  const currentGroup = mainGroups.get(id);
  const rotation = currentGroup.rotation();
  currentGroup.rotation(0);

  const newParams = transformer.getClientRect();
  const newWidth = (newParams.width - start[1])  / scale;
  const newHeight = (newParams.height - start[2]) / scale;
  const shiftX = (newParams.x - start[0].x) /scale;
  const shiftY = (newParams.y - start[0].y) /scale;

  const updateConfigs = { ...currentGroup.attrs.configs, rectW: newWidth, rectH: newHeight }
  currentGroup.setAttrs({ configs: updateConfigs });

  setAreaParams(currentGroup, rectGroups[id], borderLayer[id], updateConfigs, scale, shiftX, shiftY);

  // stageSave.children.batchDraw();
  if (rotation) currentGroup.rotation(rotation);
}

const recountSize = (id, transformer, scale, stage, configs) => {
  let newParams = transformer.getClientRect();
  const currentGroup = mainGroups.get(id);
  const rotation = currentGroup.rotation()
  const currentWidth = newParams.width/scale;
  const currentHeight = newParams.height/scale;
  const currentX = newParams.x/scale + currentWidth / 2 - stage.x() / scale;
  const currentY = newParams.y/scale + currentHeight / 2 - stage.y() / scale;
  let finalWidth = currentWidth;
  let finalHeight = currentHeight;

  if(rotation) {
    currentGroup.rotation(0);
    newParams = transformer.getClientRect();
    finalWidth = newParams.width/scale;
    finalHeight =  newParams.height/scale;
  }

  fixArea(id, configs, finalWidth, finalHeight, currentX, currentY);

  if(rotation) {
    currentGroup.rotation(rotation);
  }
}

export const areaActions = {
  editAction: (id, component, configs) => {
    const currentGroup = mainGroups.get(id);
    const appStage = new AppStage();
    cloneAreas[id] = _.cloneDeep(currentGroup);
    appStage.editing = id;

    const confs = currentGroup.attrs.configs;

    component.editArea(id, confs, currentGroup);

    destroyTransformer();
    borderLayer[id].visible(false);
  },
  copyAction: (id, component, configs) => {
    const currentGroup = mainGroups.get(id);
    const appStage = new AppStage();
    const mainLayer = appStage.children[0];
    const rotation = currentGroup.rotation();
    // const skewY = currentGroup.skewY();
    currentGroup.rotation(0);
    currentGroup.skewY(0);

    const conf = currentGroup.attrs.configs
    const updatedConf = {...conf, draggable: true};
    const attrs = rectGroups[id].getClientRect();

    const { mainGroup } = generateArea(updatedConf, builder, null, attrs);

    if (rotation) currentGroup.rotation(rotation);

    mainLayer.add(mainGroup);

    deselectGroup();
    appendTableToList(mainGroups);
    borderLayer[id].visible(false);

  },
  deleteAction: (id, component) => {
    component.deleteConfirmation(id, "area");
  }
}
