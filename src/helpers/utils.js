import Konva from 'konva'
import { buttonsList, buttonSize, buttonsOrder } from './Constants';
import { AppStage } from "@/core/AppStage";
import { mainGroups } from "@/core/MainGroups";
import { textActions } from './text/generator';
import { stageActions } from './stage/generator';
import { areaActions } from './area/generator';
import { tableActions } from './table/generator';
import { sectionActions } from './section/_generator';

export class ActionButtonsGroup {
  constructor(group, component, stage) {
    if (!ActionButtonsGroup.instance) {
      ActionButtonsGroup.instance = this;
    }

    this.actionButtons = new Konva.Group({ type: 'actions' });
    this.buttonSize = 45;
    ActionButtonsGroup.instance.group = group;
    ActionButtonsGroup.instance.component = component;
    ActionButtonsGroup.instance.stage = stage;
    this.buttonActionHandle = this.buttonActionHandle.bind(ActionButtonsGroup.instance);
    return ActionButtonsGroup.instance;
  }

  hideActions() {
    this.actionButtons.visible(false);
  }

  destroyButtons() {
    this.actionButtons.destroy();
  }

  async changeFreezeIcon(freezeType) {

    const freezeIcon = !freezeType ? "/img/freeze_icon.svg" : "/img/unfreeze_icon.svg";
    const loadImg = function (img, url) {
      return new Promise((resolve, reject) => {
        img.src = url;
        img.onload = () => resolve(img);
      });
    };
    const freezeBtn = this.actionButtons.children.find(
      (child) => child.attrs.type === "freezeAction"
    );

    if(freezeBtn) {
      freezeBtn.setAttrs({
        image: await loadImg(new Image(), freezeIcon)
      })
    }
    
  }

  buttonActionHandle(type) { //button type, editAction, copyAction, deleteAction, sortAction
    if(this.group) { //selected element
      if(type === 'editAction' || type === 'copyAction') {
        this.hideActions();
      }

      if(type === 'freezeAction') {
        this.changeFreezeIcon(this.group.attrs.draggable);
        freezeAction(this.group.attrs.id);
      } else {
        // Todo add cases to constant
        switch (this.group.attrs.type) { //selected element type
          case 'text':
            textActions[type](this.group.attrs.id, this.component, this.group.attrs.configs, this.stage) // text element functions from textActions object
            break;
          case 'stage':
            stageActions[type](this.group.attrs.id, this.component, this.group.attrs.configs, this.stage) //scene element functions from stageActions object
            break;
          case 'round':
          case 'square':
          case 'rectangle':
            tableActions[type](this.group.attrs.id, this.component, this.group.attrs.configs, this.stage)
            break;
          case 'area':
            areaActions[type](this.group.attrs.id, this.component, this.group.attrs.configs, this.stage) //scene element functions from stageActions object
            break;
          case 'section':
            sectionActions[type](this.group.attrs.id, this.component, this.group.attrs.configs, this.stage)
            break;
        }
      }
    }
  };

  async addActionsGroup(layer) {
    const loadImg = function (img, url) {
      return new Promise((resolve, reject) => {
        img.src = url;
        img.onload = () => resolve(img);
      });
    };

    if(!this.actionButtons.children.length) {
      await Promise.all(
        buttonsList.map(async (item, i) => {
          const { imageUrl, type } = item;
          const actionButtonsElement = new Konva.Image({
            x: i * buttonSize,
            y: 0,
            type,
            image: await loadImg(new Image(), imageUrl),
          });

          actionButtonsElement.addEventListener('click', () => this.buttonActionHandle(type));
          actionButtonsElement.on("mouseenter", function () {
            if(ActionButtonsGroup.instance.stage) {
              ActionButtonsGroup.instance.stage.container().style.cursor = "pointer";
            }
          });

          actionButtonsElement.on("mouseleave", function () {
            if(ActionButtonsGroup.instance.stage) {
              ActionButtonsGroup.instance.stage.container().style.cursor = "default";
            }
          });

          this.actionButtons.add(actionButtonsElement);
        })
      );
    }

    layer.add(this.actionButtons);

    this.actionButtons.width = 0;
    this.actionButtons.position({
      x: 0,
      y: 0,
    });

    this.actionButtons.visible(false);
  }
}

export class StaticClass {
  constructor(group, component, stage) {
    if (!StaticClass.instance) {
      this.buttonGroups = new ActionButtonsGroup();
      StaticClass.instance = this;
    } else {
      StaticClass.instance.group = group;
      StaticClass.instance.component = component;
      StaticClass.instance.stage = stage;
      StaticClass.buttonGroups = new ActionButtonsGroup(group, component, stage);
    }

    // StaticClass.instance.group = group;
    return StaticClass.instance;
  }

  async setButtonsOptions(group) {
    const appStage = new AppStage();
    const actionButtons = this.buttonGroups.actionButtons;

    if(appStage.selected.length > 0) {
      const $border = group.children.find(
        (child) => child.attrs.type === "border"
      );

      const groupType = group.attrs.type;
      const groupX = group.attrs.x;
      const borderY = $border.attrs.y ? $border.attrs.y : 0;
      const groupY = $border.getClientRect().y - appStage.y();
      const groupHeight = $border.getClientRect().height;
      const currentButtons = buttonsOrder[groupType];
      this.buttonGroups.changeFreezeIcon(!group.attrs.draggable);
      actionButtons.width = buttonSize * currentButtons.length;

      for (let i = 0; i < actionButtons.children?.length; i++) {
        const actionsButton = actionButtons.children[i];
        const buttonType = actionsButton.attrs.type;
        const foundType = currentButtons.findIndex((item) => {
          return item === buttonType;
        });

        if(foundType >= 0) {

          actionsButton.visible(true);

          actionsButton.position({
            x: foundType * buttonSize
          })
        } else {
          actionsButton.visible(false);
        }
      }

      actionButtons.visible(true);
      actionButtons.position({
        x: groupX - actionButtons.width / 2 ,
        y: (groupY + groupHeight) / appStage.scaleX() + 20 - borderY
      });
      actionButtons.moveToTop();

      group.on('dragmove', () => {
        if(appStage.selected.length > 0 && group.attrs.id === appStage.selected[0]) {
          const currentHeight = $border.getClientRect().height;
          const bordercurrentY = $border.attrs.y ? $border.attrs.y : 0;
          const newX = group.attrs.x - actionButtons.width / 2;
          const newY = ($border.getClientRect().y  - appStage.y()  + currentHeight )/ appStage.scaleX() + 20 - bordercurrentY;
          actionButtons.position({
            x: newX,
            y: newY
          });
        }
      });

      setTimeout(()=>{
        if(appStage.trElement) {
          appStage.trElement.on('transform', () => {
            const newParams = $border.getClientRect();
            actionButtons.setAttrs({
              x: (newParams.x + newParams.width/ 2 - appStage.x())/appStage.scaleX() - actionButtons.width/2,
              y: (newParams.y - appStage.y() + newParams.height)/appStage.scaleX() + 20
            });
          });
        }
      },0)

    } else {
      actionButtons.visible(false);
      actionButtons.width = 0;
      actionButtons.position({
        x: 0,
        y: 0
      });
    }
  }
}

//count venue parameters after saving
export const countVenueSize = (reposition) => {
  const appStage = new AppStage();
  let maxY = -Infinity;
  let minY = Infinity;

  let minX = Infinity;
  let maxX = -Infinity;

  let oldScale = appStage.scaleX();
  let oldX = appStage.x();
  let oldY = appStage.y();
  AppStage.scale({x: 1, y: 1});
  AppStage.position({x: 0, y: 0});
  AppStage.visible(false);

  if(appStage.transformer) {
    destroyTransformer();
  }

  const allElements = mainGroups.getAll();

  minY = Object.values(allElements).reduce((max, current) => {
      let height  = current.getClientRect().height;
      const { y } = current.attrs;
      return y - height / 2 < max ? y - height / 2 : max;
  }, Infinity);

  maxY = Object.values(allElements).reduce((max, current) => {
    let height = current.getClientRect().height;
    const { y } = current.attrs;
    return y + height / 2 > max ? y + height / 2 : max;
  }, -Infinity);

  minX = Object.values(allElements).reduce((max, current) => {
    let width = current.getClientRect().width;
    const { x } = current.attrs;
    return x - width / 2 < max ? x - width / 2 : max;
  }, Infinity);

  maxX = Object.values(allElements).reduce((max, current) => {
    let width = current.getClientRect().width;
    const { x } = current.attrs;
    return x + width / 2 > max ? x + width / 2 : max;
  }, -Infinity)

  const venueInnerWidth = (maxX - minX) + 80;
  const venueInnerHeight = (maxY - minY) + 80;
  const venueLeft = minX - 40;
  const venueTop = minY - 40;

  AppStage.setAttrs({
    venueWidth: venueInnerWidth,
    venueHeight: venueInnerHeight,
    venueLeft: venueLeft,
    venueTop: venueTop,
  })

  if(reposition) {
    repositionVenue(appStage, allElements, venueInnerWidth, venueInnerHeight, venueLeft, venueTop);
  } else {
    AppStage.scale({x: oldScale, y: oldScale});
    AppStage.position({x: oldX, y: oldY});
  }

  AppStage.visible(true);

}

//hover group
export const hoverGroup = ($element, $border, id) => {
  const appStage = new AppStage();

  $element.on("mouseenter", () => {
    if(!appStage.editing) {
      appStage.container().style.cursor = "pointer";
      $border[id].visible(true);
    }
  });

  $element.on("mouseleave", () => {
    if(!appStage.editing) {
      appStage.container().style.cursor = "default";
      if (appStage.selected.length == 0 || appStage.selected.length > 0 && !appStage.selected.includes(id)) {
        $border[id].visible(false);
      }
    }
  });
};

//select/unselect group
export const selectGroup = ($element, id, component) => {
  const appStage = new AppStage();

  $element.on("click", async () => {
    if(appStage.shiftPressed && !appStage.editing) {

      const actionsButtons = new ActionButtonsGroup();
      const layerBorder = $element.children.find(
        (child) => child.attrs.type === "border"
      );

      if(appStage.transformer) {
        destroyTransformer();
      }

      actionsButtons.hideActions();
      layerBorder.visible(true);
      
      AppStage.addArr(id);

    } else if(!appStage.editing) {
        const currentGroup = $element;
        const initactions = new StaticClass(currentGroup, component, appStage);
        const transforming = currentGroup.attrs.transforming;

        if(appStage.selected.length > 1) {
          deselectAllGroups(appStage, id);
          
        }

        if(appStage.selected.length > 0) {
          if(appStage.selected[0] === id) {
              AppStage.resetSelected()
            if(appStage.transformer) {
              destroyTransformer();
            }
     
          } else {
            const oldSelected = appStage.selected[0];
            const allItems = mainGroups.getAll();
    
            for (const [key, value] of Object.entries(allItems)) {
              if(key === oldSelected) {
                const layerBorder = value.children.find(
                  (child) => child.attrs.type === "border"
                );

                layerBorder.visible(false);

                if(appStage.transformer) {
                  destroyTransformer();
                }
              }
            }

            AppStage.resetSelected()
            AppStage.addArr(id);

            if(transforming) {
              setTimeout(() => {
                activateTransformer($element);
              }, 0);
            };

          }
        } else {
          AppStage.addArr(id);
          if(transforming) {
            setTimeout(() => {
              activateTransformer($element);
            }, 0);
          };
        
        }

        await initactions.setButtonsOptions(currentGroup);
      }
  })
}
 
export const deselectGroup = () => {
  const appStage = new AppStage();
  AppStage.addKey('editing', null);
  AppStage.resetSelected();

  if (appStage.transformer) {
    destroyTransformer();
  }
};

const activateTransformer = (group) => {
  const appStage = new AppStage();
  const anchorsPoint = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
    "middle-right",
    "middle-left",
    "top-center",
    "bottom-center",
  ]

  let transformer = group.children.find(//find transforming element in current group
    (child) => child.attrs.type === 'transform'
  );

  let tr = new Konva.Transformer({
    keepRatio: false, // Disable aspect ratio preservation
    nodes: [transformer],
    enabledAnchors: anchorsPoint,
    borderStroke: "gray",
    anchorFill: "none",
    anchorSize: 8,
    rotateEnabled: false,
  });

  group.add(tr);
  AppStage.addKey('transformer', tr)
  AppStage.addKey('trElement', transformer);

  appStage.trElement.on('transformstart', ()=>{
    limitTrBoundBox(appStage.transformer, group, appStage.scaleX());
  })
}

export const destroyTransformer = () => {
  const appStage = new AppStage();
  appStage.transformer.destroy();
  AppStage.addKey('transformer', null)
  AppStage.addKey('trElement', null);
}

const limitTrBoundBox = (transformer, group, scale) => {
  let groupLimitedSizes = group.attrs.type === 'stage' ? [160, 60, 4000, 800] : [200,200,4000,4000] //min-widht, min-height, max-width, max-height

  transformer.boundBoxFunc(function (oldBox, newBox) {
    if (newBox.width < groupLimitedSizes[0]*scale || newBox.width > groupLimitedSizes[2]*scale) {
      return oldBox;
    }

    if (newBox.height < groupLimitedSizes[1]*scale || newBox.height > groupLimitedSizes[3]*scale ) {
      return oldBox;
    }

    return newBox;
  });
}

export const resetParams = (id, configs) => {
  const currentGroup = mainGroups.get(id);
  const confs = currentGroup.attrs.configs;
  const updateConfigs = { ...confs, skew: 0, rotation: 0, curveValue: 0 };

  currentGroup.setAttrs({ configs: updateConfigs });
  configs = updateConfigs;
}

const freezeAction = (id) => {
  const currentGroup = mainGroups.get(id);
    const conf = currentGroup.attrs.configs;

    if(conf.draggable === undefined || conf.draggable) {
      currentGroup.setAttrs({ configs: { ...conf, draggable: false } });
      currentGroup.setAttrs({ draggable: false })
    } else {
      currentGroup.setAttrs({ configs: { ...conf, draggable: true } });
      currentGroup.setAttrs({ draggable: true });
    }
}

function handleShiftKeyPress(event) {
  if(AppStage.instance && event.shiftKey) {
    AppStage.addKey('shiftPressed', true);
  }
}

// Глобальная функция для обработки событий keyup
function handleShiftKeyRelease(event) {
  if(AppStage.instance) {
    AppStage.addKey('shiftPressed', false);
  }
}

// Добавление обработчиков событий
export function addListeningToShiftKeys() {
  document.addEventListener('keydown', handleShiftKeyPress);
  document.addEventListener('keyup', handleShiftKeyRelease);
}

// Глобальная функция для остановки обработчиков событий
export function stopListeningToShiftKeys() {
  document.removeEventListener('keydown', handleShiftKeyPress);
  document.removeEventListener('keyup', handleShiftKeyRelease);
}

export const dragGroups = ($element, stage) => {

  const allItems = mainGroups.getAll();
  let selectedIds, selectedGroups, lastPos;

  $element.on('dragstart', () => {
    selectedIds = stage.selected;
    selectedGroups = selectedIds ? Object.values(allItems).filter(el => selectedIds.includes(el.attrs.id)) : null;
    lastPos = stage.getPointerPosition();
  })

  $element.on('dragmove', () => {
    let pos = stage.getPointerPosition();
    let dx = pos.x - lastPos.x;
    let dy = pos.y - lastPos.y;

    if(selectedIds && selectedIds.includes($element.attrs.id)) {
      if(selectedGroups) {
        selectedGroups.forEach(group => {
          const frozen = group.attrs.configs.draggable !== undefined ? !group.attrs.configs.draggable : false;
          if(group.attrs.id !== $element.attrs.id && !frozen) {
            group.move({
              x: dx / stage.scaleX(),
              y: dy / stage.scaleX()
            })
          }
        });
      }
    }

    lastPos = pos;
  })
}

const deselectAllGroups = (stage, reselect) => {
  if(stage.selected) {
    const selectedIds = stage.selected;
    AppStage.resetSelected()
    const allItems = mainGroups.getAll();
    const selectedGroups = Object.values(allItems).filter(el => selectedIds.includes(el.attrs.id));
  
    if(!reselect) {
      const actionsButtons = new ActionButtonsGroup();
      actionsButtons.hideActions();

      if(stage.transformer) {
        destroyTransformer();
      }
    }

    selectedGroups.forEach(group => {
      if(!reselect || reselect && group.attrs.id !== reselect) {
        const $border = group.children.find(
          (child) => child.attrs.type === "border"
        );

        $border.visible(false);
      }
    })
  }
}

export const deselectWithStageClick = () => {
  const appStage = new AppStage();
  appStage.on('click', function (e) {
    const x = e.evt.layerX;
    const y = e.evt.layerY;
    const objects = appStage.getIntersection({x: x, y: y});

    if (!objects) {
      deselectAllGroups(appStage)
    }
  });
}

export const removeUnnecessaryElements = () => {
  const actionsButtons = new ActionButtonsGroup();
  const allElements = mainGroups.getAll();
  actionsButtons.destroyButtons();
  Object.values(allElements).forEach(group => {
    group.children.forEach(element => {
      if (element.attrs.type === "border" || element.attrs.type === "transform") {
        element.destroy();
      }
    });
  })
}


export const getSkeletone = (selector = "add-venue-builder-skeleton") => {
  const { stageJson } = getStageJson();
  const newStage = Konva.Node.create(stageJson, selector);

  const layer = newStage.children[0];

  const allElements = layer.children;

  const removedElementsTypes = ['border', 'transform', 'cover', 'name', 'area_name', 'left', 'right'];
  const changedElementsType = ['rectangle'];
 
  allElements.forEach(group => {
    if(group.attrs.type !== 'stage' && group.attrs.type !== 'text' && group.attrs.type !== 'actions') {
      const children = group.children;
      for(let i =  children.length - 1; i >= 0; i--) {
        const currentElement = children[i];
        const childType =  currentElement.attrs.type;
       
        if(removedElementsTypes.includes(childType)) {
           currentElement.destroy();
        } else if (changedElementsType.includes(childType)) {
          
           currentElement.setAttrs({
            fill: "#929292",
          });
        } else {
          let seatsGroup = null;
          if(currentElement.attrs.group) {
            seatsGroup = currentElement;
          } else {
            const childDeepGroup = currentElement.children ? currentElement.children.find(
              (g) => g instanceof Konva.Group
            ): null;
            const childDeepRect =  currentElement.children ? currentElement.children.find(
              (g) => g instanceof Konva.Rect || g instanceof Konva.Circle
            ): null;
            if(childDeepRect) {
              childDeepRect.setAttrs({
                fill: "#929292",
              });
            }
            if(childDeepGroup.attrs.group) {
              seatsGroup = childDeepGroup
            }
          }

          if(seatsGroup) {
            fillSkeletonLayer(seatsGroup);
          }
        }
      }
    }
  })

  return newStage.toJSON();
};

const fillSkeletonLayer = (findSeats) => {
  if (findSeats && findSeats.children.length) {
    for (let i = findSeats.children.length - 1; i >= 0; i--) {
      const seat = findSeats.children[i];
      const rect = seat.children.find((g) => g instanceof Konva.Rect);
      const text = seat.children.find((g) => g instanceof Konva.Text);
      rect.fill("#929292");

      if (text) text.destroy(false);

      if (seat.attrs.deleted) {
        seat.destroy();
      }
    }
  }
};

export const getStageJson = (id) => {
  const appStage = new AppStage();

  if (Object.keys(mainGroups).length) {
    countVenueSize();
  }

  let stageJSON = appStage.toJSON();
  let image = appStage.toDataURL();
  return { stageJson: stageJSON, image };
};

export const repositionVenue = (stage, allElements, venueWidth, venueHeight, venueLeft, venueTop) => {

  for (const [key, value] of Object.entries(allElements)) {
    value.move({
      x: -venueLeft,
      y: -venueTop
    });

    if(stage.selected && stage.selected.length === 1 && key === stage.selected[0]) {
      const actionsButtons = new ActionButtonsGroup();
      const layerBorder = value.children.find(
        (child) => child.attrs.type === "border"
      );

      layerBorder.visible(false);

      actionsButtons.hideActions();
    }
  }

  const xScale = window.innerWidth / venueWidth;
  const yScale = window.innerHeight / venueHeight;

  const scaleSize =
    xScale < 1 || yScale < 1 ? (xScale > yScale ? yScale : xScale) : 1;

  const xShift =
     (window.innerWidth - venueWidth * scaleSize )  / 2 ;
  const yShift =
     (window.innerHeight - venueHeight * scaleSize)   / 2 ;

  stage.position({
    x: xShift,
    y: yShift
  })

  stage.scale({ x: scaleSize, y: scaleSize });
  if(stage.attrs.hold && scaleSize > stage.attrs.hold || scaleSize > 0.2) {
    document.querySelector('.min_btn').classList.remove('inactive');
  }
  document.querySelector('.max_btn').classList.remove('inactive');
}

export const moveElements = (e) => {
  const appStage = new AppStage();
  let shiftSize = appStage.shiftPressed ? 5 : 1;
  switch (e.key) {
    case 'ArrowUp':
      shiftGroup('y', -shiftSize)
      break;
    case 'ArrowDown':
      shiftGroup('y', shiftSize)
      break;
    case 'ArrowLeft':
      shiftGroup('x', -shiftSize)
      break;
    case 'ArrowRight':
      shiftGroup('x', shiftSize)
      break;
  }
};

const shiftGroup = (axis, moveSize) => {
  const appStage = new AppStage();
  const allItems = mainGroups.getAll();
  let selectedGroups;
  const selectedIds = appStage.selected;

  if(selectedIds.length > 1) {
    selectedGroups = selectedIds ? Object.values(allItems).filter(el => selectedIds.includes(el.attrs.id)) : null;
    if(selectedGroups) {
      selectedGroups.forEach(group => {
        const frozen = group.attrs.configs.draggable !== undefined ? !group.attrs.configs.draggable : false;
        if(!frozen) {
          let moveObj = {};
          moveObj[axis] = moveSize;
          group.move(moveObj);
        }
      });
    }
  } else if (selectedIds.length === 1) {
    const currentElement = mainGroups.get(selectedIds[0]);
    const mainLayer = appStage.children[0];
    const actionsButtons = mainLayer.children.find(
      (child) => child.attrs.type === "actions"
    );
    let moveObj = {};
    moveObj[axis] = moveSize;
    currentElement.move(moveObj);
    actionsButtons.move(moveObj)
  }

}

