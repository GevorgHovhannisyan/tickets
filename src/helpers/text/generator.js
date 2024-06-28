import Konva from "konva";
import { uid } from "uid";

import { deselectGroup, hoverGroup, selectGroup, dragGroups } from "../utils";
import { TextParams } from "../Constants";
import {AppStage} from "@/core/AppStage";
import { mainGroups } from "@/core/MainGroups";


let builder;
let borderLayer = {};
let cloneText = {};

//generate text element with default configs
export const generateText = (configs, component, textId, position) => {
    const appStage = new AppStage();
    builder = component;
    const id = textId ? textId : uid(6);
    const draggable = configs.draggable !== undefined ? configs.draggable : true;

    let mainGroup = new Konva.Group({
        id,
        draggable: draggable,
        type: 'text', 
        configs,
    });  
  
    let text = new Konva.Text({
        type: 'text',
        x: 0,
        y: 0,
        fill: '#ffffff',
        verticalAlign: 'middle',
        fontFamily: !configs.bold ? TextParams.FONT_REGULAR : TextParams.FONT_BOLD,
        text: configs.upperCase ? configs.text.toUpperCase() : configs.text,
        fontSize: configs.fontSize,
        lineHeight: configs.lineHeight,
        letterSpacing: configs.spacing,
        align: configs.alignment
    })

    mainGroup.add(text);

    let textWidth = mainGroup.getClientRect().width;
    let textHeight = mainGroup.getClientRect().height;
    let layerBorder = new Konva.Shape({
        sceneFunc: function (context) {
          context.beginPath();
          context.setLineDash([5, 5]);
          context.lineTo(-10, -10);
          context.lineTo(textWidth + 10, -10);
          context.lineTo(textWidth + 10, textHeight + 10);
          context.lineTo(-10, textHeight + 10);
          context.strokeStyle = 'gray';
          context.stroke();
          context.closePath(); 
          context.fillStrokeShape(this); 
        },
        stroke: "gray", 
        strokeWidth: 1, 
        type: "border",
    });
  
    mainGroup.add(layerBorder);
    mainGroups.add(mainGroup, id);
    borderLayer[id] = layerBorder;
    borderLayer[id].visible(false);

    layerBorder.setAttrs({
      width: text.getClientRect().width + 20,
      height: text.getClientRect().height + 20
    })

    if (position) {
 
        mainGroup.setAttrs({
          x: position.x, 
          y: position.y,
          offsetX: textWidth / 2,
          offsetY: textHeight / 2,
        })
          
      } else {
    
        mainGroup.setAttrs({
          offsetX: textWidth / 2,
          offsetY: textHeight / 2,
          x: ((-appStage.x() + appStage.width() / 2) / appStage.scaleX()),
          y: (((-appStage.y() + 40) / appStage.scaleY() + (textHeight / 2))),
        });
        
    }

    const currentGroup = mainGroups.get(id);
    if(configs && configs.rotation) {
        rotateText(currentGroup, configs.rotation, configs)
    }

    hoverGroup(currentGroup, borderLayer, id); //hover this text
    
    selectGroup(currentGroup, id,  component); //select/unselect this text

    dragGroups(currentGroup, appStage)

    return { mainGroup };

}

//cancel text edit
export const cancelTextChanges = (configs) => {
  const layerId = configs?.layerId;
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];
  const currentGroup = mainGroups.get(layerId);
  const position = currentGroup.position();

  currentGroup.destroy();
  const { mainGroup } = generateText(
    configs,
    builder,
    layerId,
    // attrs,
    position
  );
  
  mainLayer.add(mainGroup);
  deselectGroup();
};

//change text
export const updateText = (id, configs) => {
  const currentGroup = mainGroups.get(id);
  const appStage = new AppStage();
  const mainLayer = appStage.children[0];

  const position = currentGroup.position();

  currentGroup.destroy();
  
  const { mainGroup } = generateText(
    configs,
    builder, 
    id,
    // attrs,
    position
  );

  mainLayer.add(mainGroup);

  mainGroups.add(mainGroup, id);

  currentGroup.setAttrs({ configs });
   
};

//text delete
export const deleteTextElement = (id) => {
  const currentGroup = mainGroups.get(id);
  currentGroup.destroy();
  AppStage.resetSelected()
}

//text rotate
const rotateText = (group, rotation, configs) => {
  group.setAttrs({ configs: { ...configs, rotation } });
  group.rotation(rotation);
  configs = { ...configs, rotation };
};

//text actions object
export const textActions = {
  editAction: (id, component, configs, stage) => {
    const currentGroup = mainGroups.get(id);
    cloneText[id] = _.cloneDeep(currentGroup);
    AppStage.addKey('editing', id);

    const confs = currentGroup.attrs.configs;
   
    component.editText(id, confs, currentGroup);
  
    borderLayer[id].visible(false);
  
  },
  copyAction: (id, component, configs) => {
    const currentGroup = mainGroups.get(id);
    const appStage = new AppStage();
    const mainLayer = appStage.children[0];

    const conf = currentGroup.attrs.configs;
    const updatedConf = {...conf, draggable: true};
    const { mainGroup } = generateText(updatedConf, component);
    mainLayer.add(mainGroup);
    deselectGroup();
    borderLayer[id].visible(false);
  },
  deleteAction: (id, component) => {
    component.deleteConfirmation(id, "text");
  }
}

