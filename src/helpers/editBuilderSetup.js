import Konva from "konva";

import {
  makeStageSkeleton,
  getMinMaxCoords
} from "./utilsEdit";

import {
  generateScene
} from "./stage/generator";

import {
  generateText
} from "./text/generator";

import {
  generateArea
} from "./area/generator"

import {
  createTable
} from "./table/generator"

import {
  generateSection
} from "./section/_generator"

import { uid } from "uid";
import _ from "lodash";
import { AppStage } from "@/core/AppStage";
import { mainGroups } from "@/core/MainGroups";
import { seatsGroups } from "@/core/SeatsGroup";
import { StaticClass, addListeningToShiftKeys, countVenueSize, deselectWithStageClick, moveElements } from "./utils";
import { createSection } from "./section";

let builder;
let dirtyStage;
let minimalScale = null;
let scale = 1;
let wheelX = 0;
let wheelY = 0;
let groupWidth = 0;
let groupHeight = 0;
let venueLeft = 0;
let venueTop = 0;

export const setupBuilder = (container, venue, component) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  minimalScale = 0.2;

  const staticInstance = new StaticClass();
  staticInstance.buttonGroups.addActionsGroup(mainLayer);

  // stage = Konva.Node.create(venue.datajson, container);
  dirtyStage = Konva.Node.create(venue.datajson, "venue-builder-dirty");
  builder = component;

  generateListeners(appStage, component, venue);
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
    const { pos } = dragStagePosition(appStage, lastPos)
      lastPos = pos;
  });

  appStage.on("mouseup", function () {
    isDragging = false;
  });

  appStage.on("mouseleave", function () {
    isDragging = false;
  });

  addListeningToShiftKeys();

  deselectWithStageClick(mainLayer);

  document.addEventListener('keydown', moveElements);
};

export const holdZoomOut = ($hold) => {
  const appStage = new AppStage();
  minimalScale = $hold ? appStage.scaleX() : 0.2;
  if(document.querySelectorAll('.min_btn').length > 0) {
    if($hold)  builder.minDisabled = true
      else  builder.minDisabled = false
  }
  appStage.attrs.hold = $hold ? minimalScale : null;
}

const generateListeners = (stage, component, venue) => {
  const layerChildrens = dirtyStage.children[0].children;
  for (let i = 0; i < layerChildrens.length; i++) {
    const group = layerChildrens[i];
    let attrs = group.getAttrs();
    const { id, configs, seatsBind, x, y } = attrs;

    if (attrs.type === "section") {
      createSeatedSection(configs, component, { x, y }, id, seatsBind);
    } else if (attrs.type === "area") {
      createAdmissionArea(configs, component, id, attrs, { x, y });
    } else if (attrs.type === "round" || attrs.type === "rectangle" || attrs.type === "square") {
      createTableSeats(configs, component, id, { x, y }, seatsBind);

    } else if (attrs.type === 'stage'){
      createScene(configs, component, id, { x, y });
    } else if (attrs.type === 'text') {
      createText(configs, component, id, { x, y });
    }
  }
};

export const deleteElement = (id) => {
  const currentGroup = mainGroups.get(id);
  currentGroup.destroy();
  delete mainGroups.get(id);
  mainGroups.remove(id)
};

export const stageScaleWheel = () => {
  const appStage = new AppStage();
  appStage.scale({ x: 1, y: 1 });
  appStage.position({ x: 0, y: 0 });
  appStage.attrs.hold = dirtyStage.attrs.hold;

  scaleWheel(appStage);
  const allElements = mainGroups.getAll();

  if(dirtyStage.attrs.venueWidth) {
    groupWidth = dirtyStage.attrs.venueWidth;
    groupHeight = dirtyStage.attrs.venueHeight;
    venueLeft = dirtyStage.attrs.venueLeft;
    venueTop = dirtyStage.attrs.venueTop;
  } else {
    const { maxY, minY, minX, maxX } = getMinMaxCoords(allElements)
    venueLeft = -minX;
    venueTop = -minY;
    groupWidth = maxX - minX;
    groupHeight = maxY - minY;
  }


  for (const [key, value] of Object.entries(allElements)) {
    value.move({
      x: -venueLeft,
      y: -venueTop
    })
  }

  const xScale = window.innerWidth / groupWidth;
  const yScale = window.innerHeight / groupHeight;

  const scaleSize =
    xScale < 1 || yScale < 1 ? (xScale > yScale ? yScale : xScale) : 1;

  const xShift =
     (window.innerWidth - groupWidth * scaleSize )  / 2 ;
  const yShift =
     (window.innerHeight - groupHeight * scaleSize)   / 2 ;

  scale = appStage.scaleX();
  appStage.position({
    x: xShift,
    y: yShift
  })

  appStage.scale({ x: scaleSize, y: scaleSize });

  if(appStage.attrs.hold) {
    if(appStage.attrs.hold > scale) {
      minimalScale = scale;
      appStage.attrs.hold = scale
    } else {
      minimalScale = appStage.attrs.hold
    }
    if(document.querySelectorAll('.hold_btn').length > 0) {
      builder.holded = true
    }
  }

};

export const scaleWheel = (stage) => {
  const appStage = new AppStage();
  document
    .getElementById("edit-venue-builder")
    .addEventListener("wheel", function (e) {
      e.preventDefault(); // Prevent page scrolling

      let oldScale = appStage.scaleX(); // Get the current scale
      let pointer = appStage.getPointerPosition(); // Get the pointer position
      let stageOldX = appStage.x();
      let stageOldY = appStage.y()
      // Calculate the new scale based on the scroll direction
      let scaleBy = e.deltaY < 0 ? 1.03 : 0.97;

      if ((e.deltaY < 0 && oldScale < 1.3) || (e.deltaY > 0 && oldScale > minimalScale)) {
        appStage.scale({ x: oldScale * scaleBy, y: oldScale * scaleBy });
        scale = appStage.scaleX()
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

        wheelX += (appStage.x() - stageOldX) * scale;
        wheelY += (appStage.y() - stageOldY) * scale;
        appStage.batchDraw(); // Redraw the stage

        if(document.querySelectorAll('.min_btn').length > 0) {
          builder.minDisabled = false
          builder.maxDisabled = false
        }
      } else if (e.deltaY < 0 && oldScale >= 1.3 && document.querySelectorAll('.max_btn').length > 0) {
        builder.maxDisabled = true
      } else if (e.deltaY > 0 && oldScale <= minimalScale && document.querySelectorAll('.min_btn').length > 0) {
        builder.minDisabled = true
      }
    });
};

export const adjustScale = (isMinus) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  let oldScale = appStage.scaleX();
  let scaleSize
  if(isMinus) {
    scaleSize = oldScale * 0.9
  } else {
    scaleSize = oldScale / 0.9
  }

  // const newScale = oldScale + delta
  let scaleValue
  if (isMinus) {
    if (scaleSize <= minimalScale) {
      scaleValue = minimalScale;
      if(document.querySelectorAll('.min_btn').length > 0) {
        builder.minDisabled = true
      }
    } else {
      scaleValue = scaleSize;
      if(document.querySelectorAll('.min_btn').length > 0) {
        builder.minDisabled = false
        builder.maxDisabled = false
      }
    }
  } else {
    if (scaleSize >= 1.3) {
      scaleValue = 1.3;
      if(document.querySelectorAll('.max_btn').length > 0) {
        builder.maxDisabled = true
      }
    } else {
      scaleValue = scaleSize;
      if(document.querySelectorAll('.min_btn').length > 0) {
        builder.minDisabled = false
        builder.maxDisabled = false
      }
    }
  }

  scale = scaleValue;
  appStage.scale({ x: scale, y: scale });
  const changedX = appStage.x() - groupWidth * (scale - oldScale) / 2;
  const changedY = appStage.y() - groupHeight * (scale - oldScale) / 2;

  appStage.position({
    x: changedX,
    y:  changedY
  });

  mainLayer.batchDraw();
}

export const getStageJson = () => {
  const appStage = new AppStage();

  if (Object.keys(mainGroups).length) {
    countVenueSize();
  }

  let stageJSON = appStage.toJSON();
  let image = appStage.toDataURL();

  return { stageJson: stageJSON, image };
};

export const createTableSeats = (configs, component, id, position, seatsBind) => {
  const { seats, type } = configs;
  const tableSeats = seatsBind ? seatsBind : [];
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];

  if(!seatsBind) {
    for (let i = 0; i < seats; i++) {
      tableSeats.push({ id: uid(6), number: i + 1 });
    }
  }

  const { mainGroup } = createTable(
    tableSeats,
    configs,
    component,
    id,
    position
  );

  mainLayer.add(mainGroup);
  appStage.draw();

  return { mainGroup };
};

export const createSeatedSection = (configs, component, position, id, seats) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const { mainGroup } =  createSection(configs, component, position, id, seats)

  mainLayer.add(mainGroup);
  appStage.draw();

  return { mainGroup };
};

export const createAdmissionArea = (configs, component, id, attrs, position) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const { mainGroup } = generateArea(configs, component, id, attrs, position);

  mainLayer.add(mainGroup);
  appStage.draw();

  return { mainGroup};
};

export const createScene = (configs, component, id, position) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const { mainGroup } = generateScene(configs, component, id, position);

  mainLayer.add(mainGroup);
  appStage.draw();

  return { mainGroup };
};

export const createText = (configs, component, id, position) => {
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const { mainGroup } = generateText(configs, component, id, position);

  mainLayer.add(mainGroup);
  appStage.draw();

  return { mainGroup };
};

export const scaleStageBtn = (val, isMinus) => {
  adjustScale(isMinus)
}

export const dragStagePosition = (stage, lastPos) => {
  let pos = stage.getPointerPosition();
  let dx = pos.x - lastPos.x;
  let dy = pos.y - lastPos.y;

  stage.move({
    x: dx,
    y: dy
  });

  stage.batchDraw();
  const keys = Object.keys(mainGroups);

  return { pos };
}

export const resetValues = () => {
  let appStage = new AppStage();
  appStage.children[0].destroy();
  AppStage.reset();
  mainGroups.clear();
  seatsGroups.clear();
  appStage = null;
  builder = null;
  dirtyStage = null;
}
