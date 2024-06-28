import Konva from "konva";
import { uid } from "uid";
import { hoverGroup, selectGroup, deselectGroup, destroyTransformer, dragGroups } from "../utils";
import { AppStage } from "@/core/AppStage";
import { mainGroups } from "@/core/MainGroups";

let builder;
let borderLayer = {};
let cloneScene = {};
let scene = null;
let transformStartBound;

//scene generation
export const generateScene = (configs, component, stageId, position) => {
  const appStage = new AppStage();
  builder = component;
  const id = stageId ? stageId : uid(6);
  const sceneWidth = configs && configs.width ? configs.width : 400;
  const sceneHeight = configs && configs.height ? configs.height : 120;
  const draggable = configs.draggable !== undefined ? configs.draggable : true;
  //create stage group component
  let mainGroup = new Konva.Group({
    id,
    configs,
    draggable: draggable,
    rotation: 0,
    width: sceneWidth,
    height: sceneHeight,
    type: 'stage',
    transforming: true
  });

  //create layer for transforming
  let transformer = new Konva.Rect({
    width: sceneWidth,
    height: sceneHeight,
    type: "transform",
  })

  //create stage inner components - arc, top line, text and shape
  let arc = new Konva.Line({
    points: [0, 0, sceneWidth / 2, sceneHeight, sceneWidth, 0],
    stroke: '#fff',
    strokeWidth: 3,
    lineCap: 'round',
    tension: 0.75,
  });

  let top = new Konva.Line({
    points: [0, 0, sceneWidth, 0],
    stroke: '#fff',
    strokeWidth: 3,
  })

  let sceneName = new Konva.Text({
    text: "STAGE",
    fill: "#fff",
    fontSize: 24,
    align: 'center',
    verticalAlign: 'middle',
    width: sceneWidth,
    height: sceneHeight,
    fontFamily: "Lato-Bold",
    lineJoin: 'bevel',
    letterSpacing: 5,
    type: "text",
  })

  let layerBorder = new Konva.Rect({
    width: sceneWidth + 20,
    height: sceneHeight + 20,
    x: -10,
    y: -10,
    stroke: 'gray',
    strokeWidth: 1,
    dash: [5,5],
    type: "border",
  });

  //add stage components in group component
  mainGroup.add(top);
  mainGroup.add(arc);
  mainGroup.add(sceneName);
  mainGroup.add(layerBorder);
  mainGroup.add(transformer);
  //set new values for variables
  mainGroups.add(mainGroup, id)
  // limitTrBoundBox(transformer);
  transformer.on("transformstart", () => {
    const konvaElement = mainGroups.get(id);
    const rotation = konvaElement.attrs.rotation;
    konvaElement.rotation(0);
    transformStartBound = transformer.getClientRect();
    konvaElement.rotation(rotation);
  })

  transformer.on("transform", () => {
    resizeScene(mainGroups.get(id), transformer, sceneName, top, arc, layerBorder, appStage.scaleX(), transformStartBound);
  })

  transformer.on("transformend", () => {
    const konvaElement = mainGroups.get(id);
    recountSize(konvaElement, transformer, sceneName, top, arc, layerBorder, appStage.scaleX(), appStage, configs)
  })

  borderLayer[id] = layerBorder;
  borderLayer[id].visible(false);
  scene = mainGroup;

  if (position) {
    mainGroup.setAttrs({
      x: position.x,
      y: position.y,
      offsetX: sceneWidth / 2,
      offsetY: sceneHeight / 2,
    })

  } else {
    mainGroup.setAttrs({
      offsetX: sceneWidth / 2,
      offsetY: sceneHeight / 2,
      x: ((-appStage.x() + appStage.width() / 2) / appStage.scaleX()),
      y: (((-appStage.y() + 40) / appStage.scaleY() + (sceneHeight / 2))),
    });
  }

  sceneName.setAttrs({
    offsetX: sceneWidth / 2,
    offsetY: sceneHeight / 2,
    x: sceneWidth / 2,
    y: sceneHeight / 2,
  });

  const currentGroup = mainGroups.get(id);
  hoverGroup(currentGroup, borderLayer, id); //hover this stage

  selectGroup(currentGroup, id, component); //select/unselect this stage

  dragGroups(currentGroup, appStage)

  if(configs && configs.rotation) {
    rotateScene(id, configs.rotation, configs)
  }

  // AppStage.addKey('hasScene', true);

  return { mainGroup, idScene: id, borderLayer };
};

//scene edit cancel
export const cancelSceneChanges = (configs) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const { layerId } = configs;
  const layerElement = mainGroups.get(layerId);
  const position = layerElement.position();

  layerElement.destroy();

  const { mainGroup } = generateScene(
    configs,
    builder,
    layerId,
    // attrs,
    position
  );
  mainLayer.add(mainGroup);
  deselectGroup();
};

//rotate scene
export const rotateScene = (id, rotation, configs) => {
  // const appStage = new AppStage();
  const sceneElement = mainGroups.get(id);
  sceneElement.rotation(rotation);
  const normalizedConfigs = { ...sceneElement.attrs.configs, rotation };
  sceneElement.setAttrs({ configs: normalizedConfigs });

  const findText = sceneElement.children.find(
    (child) => child.attrs.type === "text"
  );

  if (rotation < -90 || rotation > 90) {
      findText.rotation(-180);
  } else {
      findText.rotation(0);
  }
};

//update scene
export const updateSceneStage = (id, payload) => {
  const sceneElement = mainGroups.get(id);
  const rotation = sceneElement.rotation();
  if (rotation){
    sceneElement.rotation(rotation);
  }
};

//delete scene
export const deleteSceneElement = (id) => {
  const sceneElement = mainGroups.get(id);
  sceneElement.destroy();
  if(sceneElement) {
    mainGroups.remove(id);
  }
  AppStage.resetSelected()
  // AppStage.addKey('hasScene', false);
}

export const stageActions = {
  editAction: (id, component) => {
    const currentGroup = mainGroups.get(id);
    const appStage = new AppStage();
    cloneScene[id] = _.cloneDeep(currentGroup);
    AppStage.addKey('editing', id);

    const confs = currentGroup.attrs.configs;

    component.editScene(id, confs, currentGroup);

    if(appStage.transformer) {
      destroyTransformer();
    }

    borderLayer[id].visible(false);
  },
  copyAction: (id, component, configs) => {
    const currentGroup = mainGroups.get(id);
    const appStage = new AppStage();
    const mainLayer = appStage.children[0];

    const conf = currentGroup.attrs.configs;
    const updatedConf = {...conf, draggable: true};
    const { mainGroup } = generateScene(updatedConf, component);
    mainLayer.add(mainGroup);
    deselectGroup();
    borderLayer[id].visible(false);
  },

  deleteAction: (id, component) => {
    component.deleteConfirmation(id, "stage");
  }
}

//resize and reposition scene elements during transform
const resizeScene = (group, transformer, name, top, arc, border, scale, start) => {
  const rotation = group.attrs.rotation;

  if(rotation !== 0) {
    group.rotation(0);
    // name.rotation(0);
  }

  const newParams = transformer.getClientRect();
  const newWidth = newParams.width / scale;
  const newHeight = newParams.height / scale;
  const shiftX = (newParams.x - start.x) /scale;
  const shiftY = (newParams.y - start.y) /scale;
  let nameOffsetX = 0;
  let nameOffsetY = 0;

  if (rotation < -90 || rotation > 90) {
    nameOffsetX = newWidth;
    nameOffsetY = newHeight;
  }

  name.setAttrs({
    width: newWidth,
    height: newHeight,
    x: shiftX,
    y: shiftY,
    offsetX: nameOffsetX,
    offsetY: nameOffsetY,
  });

  top.setAttrs({
    width: newWidth,
    height: newHeight,
    points: [
      shiftX,
      shiftY,
      shiftX + newWidth,
      shiftY,
    ],
  });

  arc.setAttrs({
    width: newWidth,
    height: newHeight,
    points: [shiftX, shiftY, shiftX + newWidth / 2, shiftY + newHeight, shiftX + newWidth, shiftY],
  })

  border.setAttrs({
    width: newWidth + 20,
    height: newHeight + 20,
    offsetX: -shiftX,
    offsetY: -shiftY,
  })

  if(rotation) {
    group.rotation(rotation);
    // if (rotation < -90 || rotation > 90) {
    //     name.rotation(180);
    // } else {
    //     name.rotation(0);
    // }
  }
}

//resize and reposition scene and scene elements after transform
const recountSize = (group, transformer, name, top, arc, border, scale, stage, configs) => {
  const appStage = new AppStage();
  let newParams = transformer.getClientRect();

  const currentWidth = newParams.width/scale;
  const currentHeight = newParams.height/scale;
  const currentX = newParams.x/scale;
  const currentY = newParams.y/scale;
  let finalWidth = currentWidth;
  let finalHeight = currentHeight;
  const rotation = group.attrs.rotation;

  if(rotation !== 0) {
    group.rotation(0);
    newParams = transformer.getClientRect();
    finalWidth = newParams.width/scale;
    finalHeight =  newParams.height/scale;
  }

  const resetedPosition = {
    x: 0,
    y: 0
  }

  group.setAttrs({
    width: finalWidth,
    height: finalHeight,
    offsetX: finalWidth / 2,
    offsetY: finalHeight / 2,
  })

  transformer.setAttrs({
    width: finalWidth,
    height: finalHeight,
    scaleX: 1,
    scaleY: 1,
  })

  name.setAttrs({
    width: finalWidth,
    height: finalHeight,
    offsetX: finalWidth / 2,
    offsetY: finalHeight / 2,
    x: finalWidth / 2,
    y: finalHeight / 2,
  });

  top.setAttrs({
    points: [0, 0, finalWidth , 0],
  });

  arc.setAttrs({
    points: [0, 0, finalWidth / 2, finalHeight, finalWidth, 0],
  })

  border.setAttrs({
    width: finalWidth + 20,
    height: finalHeight + 20,
    offsetX: 0,
    offsetY: 0,
  })

  group.position({
    x: currentX + currentWidth / 2 - appStage.x() / scale,
    y: currentY + currentHeight / 2 - appStage.y() / scale,
  });

  transformer.position(resetedPosition);

  if(rotation !== 0) {
    group.rotation(rotation);
  }

  const normalizedConfigs =  { ...group.attrs.configs, width: finalWidth, height: finalHeight };
  group.setAttrs({ configs: normalizedConfigs });

}
