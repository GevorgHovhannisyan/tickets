import Konva from "konva";
import { uid } from "uid";
import { createSection } from "./section";
import { createTable } from "./table/generator";
import { generateArea } from "./area/generator";
import { generateScene } from "./stage/generator";
import { generateText } from "./text/generator";
import { AppStage } from "@/core/AppStage";
import { mainGroups } from "@/core/MainGroups";
import { StaticClass, addListeningToShiftKeys, deselectWithStageClick, moveElements } from "./utils";

let mainGroupList = {};
let minimalScale, holded = null;
let builderComponent;
let ww, wh;

export const setupBuilder = async (container, builder) => {
  const appStage = new AppStage();
  const mainLayer= appStage.children[0];
  builderComponent = builder
  minimalScale = 0.2;
  holded = null;
  ww = window.innerWidth;
  wh = window.innerHeight;
  const staticInstance = new StaticClass();
  staticInstance.buttonGroups.addActionsGroup(mainLayer);

  stageScaleWheel();

  let lastPos;

  // Flag to indicate if we are currently dragging the stage
  let isDragging = false;

  appStage.on("mousedown", function (e) {
    if (e.evt.button === 0 && e.target instanceof Konva.Stage) {
      lastPos = appStage.getPointerPosition();
      isDragging = true;
    }
  });

  appStage.on("mousemove", function (e) {
    if (!isDragging) {
      return;
    }

    let pos = appStage.getPointerPosition();
    let dx = pos.x - lastPos.x;
    let dy = pos.y - lastPos.y;

    let newPos = {
      x: appStage.x() + dx,
      y: appStage.y() + dy,
    };
    dragedX += dx;
    dragedY += dy;
    appStage.position(newPos);
    appStage.batchDraw();
    lastPos = pos;
  });

  appStage.on("mouseup", function () {
    isDragging = false;
  });

  appStage.on("mouseleave", function () {
    isDragging = false;
  });

  addListeningToShiftKeys();

  deselectWithStageClick();

  document.addEventListener('keydown', moveElements);


  return appStage;
};

export const createSeatedSection = (configs, component) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const { mainGroup} = createSection(configs, component);
  mainGroupList = { ...mainGroupList, ...mainGroups };
  mainLayer.add(mainGroup);
  appStage.draw();
  return { mainGroup };
};

export const createTableSeats = (configs, component) => {
  const { seats, type } = configs;
  const seatsBind = [];
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  for (let i = 0; i < seats; i++) {
    seatsBind.push({ id: uid(6), number: i + 1, invalid: false });
  }

  const { mainGroup, mainGroups } = createTable(
    seatsBind,
    configs,
    component
  );

  mainGroupList = { ...mainGroupList, ...mainGroups };
  mainLayer.add(mainGroup);
  appStage.draw();
  return { mainGroup };
};

export const createAdmissionArea = (configs, component) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const { mainGroup } = generateArea(configs, component);
  mainLayer.add(mainGroup);
  appStage.draw();
  mainGroupList = { ...mainGroupList, ...mainGroups };

  return { mainGroup };
};

export const createScene = (configs, component) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const { mainGroup } = generateScene(configs, component);
  mainLayer.add(mainGroup);
  appStage.draw();
  mainGroupList = { ...mainGroupList, ...mainGroups };

};

export const createText = (configs, component) => {
  const { mainGroup } = generateText(configs, component);
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  mainLayer.add(mainGroup);
  mainGroupList = { ...mainGroupList, ...mainGroups };

}

export const deleteElement = (id) => {
  mainGroupList[id].destroy();
  return { mainGroups: mainGroupList };
};
export const copyElement = (section) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  mainLayer.add(section);
  return { mainGroups: mainGroupList };
};

export const layerDraw = () => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  mainLayer.batchDraw();
  appStage.draw();
};
export const updateSectionLayout = (id, mainGroup) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const findLayer = mainLayer.children.find((l) => l.attrs.id === id);
  findLayer.destroy();
  mainLayer.add(mainGroup);
  appStage.batchDraw();

};


export const updateStageSizes = () => {
 
  const appStage = new AppStage();
  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;

  const resizeDragX = (winWidth - ww) / 2;
  const resizeDragY = (winHeight - wh) / 2;

  // Update the stage's width and height properties
  appStage.width(winWidth).height(winHeight);

  appStage.move({
    x: resizeDragX ,
    y: resizeDragY 
  })

  // Update the size of the container element to match the new dimensions
  let container = appStage.container();
  container.style.width = window.innerWidth + "px";
  container.style.height = window.innerHeight + "px";

  ww = winWidth;
  wh = winHeight;
  appStage.batchDraw();
};

let oldX = 0;
let oldY = 0;
let dragedX = 0;
let dragedY = 0;
let scale = 1;


export const holdZoomOut = () => {
  const appStage = new AppStage();

  holded = !holded;
  minimalScale = holded ? appStage.scaleX() : 0.2;
  if(document.querySelectorAll('.min_btn').length > 0) {
    if(holded) {
      builderComponent.minDisabled = true
    } else {
      builderComponent.minDisabled = false
    }
  }
  appStage.attrs.hold = holded ? minimalScale : null;

}

const stageScaleWheel = () => {
  const appStage = new AppStage();

  document.getElementById("venue-builder").addEventListener("wheel", function (e) {
    e.preventDefault(); // Prevent page scrolling

      let oldScale = appStage.scaleX(); // Get the current scale
      let pointer = appStage.getPointerPosition(); // Get the pointer position

      // Calculate the new scale based on the scroll direction
      let scaleBy = e.deltaY < 0 ? 1.03 : 0.97;

      if (
        (e.deltaY < 0 && oldScale < 1.3) ||
        (e.deltaY > 0 && oldScale > minimalScale)
      ) {
        appStage.scale({ x: oldScale * scaleBy, y: oldScale * scaleBy });
        scale = appStage.scaleX();
        // Calculate the new position of the pointer after scaling
        let newPos = {
          x: (pointer.x - appStage.x()) * scaleBy,
          y: (pointer.y - appStage.y()) * scaleBy,
        };

        // Update the position of the stage to keep the pointer at the same position
        appStage.position({
          x: pointer.x - newPos.x,
          y: pointer.y - newPos.y,
        });

        appStage.batchDraw(); // Redraw the stage

        if(document.querySelectorAll('.min_btn').length > 0) {
          builderComponent.minDisabled = false
          builderComponent.maxDisabled = false
        }
      } else if (e.deltaY < 0 && oldScale >= 1.3 && document.querySelectorAll('.max_btn').length > 0) {
        builderComponent.maxDisabled = true
      } else if (e.deltaY > 0 && oldScale <= minimalScale && document.querySelectorAll('.min_btn').length > 0) {
        builderComponent.minDisabled = true
      }
    });

};

export const adjustScale = (isMinus) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  let oldScale = appStage.scaleX();
  let scaleSize;

  if (isMinus) {
    scaleSize = oldScale * 0.9;
  } else {
    scaleSize = oldScale / 0.9;
  }

  // const newScale = oldScale + delta
  let scaleValue;

  if (isMinus) {
    if (scaleSize <= minimalScale) {
      scaleValue = minimalScale;
      if(document.querySelectorAll('.min_btn').length > 0) {
        builderComponent.minDisabled = true
      }
    } else {
      scaleValue = scaleSize;
      if(document.querySelectorAll('.min_btn').length > 0) {
        builderComponent.maxDisabled = false
        builderComponent.minDisabled = false
      }
    }
  } else {
    if (scaleSize >= 1.3) {
      scaleValue = 1.3;
      if(document.querySelectorAll('.max_btn').length > 0) {
        builderComponent.maxDisabled = true
      }
    } else {
      scaleValue = scaleSize;
      if(document.querySelectorAll('.min_btn').length > 0) {
        builderComponent.maxDisabled = false
        builderComponent.minDisabled = false
      }
    }
  }

  scale = scaleValue;
  appStage.scale({ x: scale, y: scale });
  const venueWidth = appStage.attrs.venueWidth ? appStage.attrs.venueWidth : appStage.width();
  const venueHeight = appStage.attrs.venueHeight ? appStage.attrs.venueHeight : appStage.height();
  appStage.position({
    x: appStage.x() + venueWidth * (oldScale - appStage.scaleX()) * 0.5,
    y: appStage.y() + venueHeight * (oldScale - appStage.scaleX()) * 0.5,
  });

  oldX = appStage.position().x;
  oldY = appStage.position().y;
  mainLayer.batchDraw();
};

export const appendTableToList = (mainGroups) => {
  mainGroupList = { ...mainGroupList, ...mainGroups };
};



 