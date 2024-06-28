export const setAreaParams = (group, rectangle, border, configs, scale, left, top) => {
  const rectHeight = configs.rectH ;
  const rectWidth = configs.rectW ;
  const skewSize = configs.skew ? +configs.skew : 0; // skew size
  const curveSize = configs.curveValue ? configs.curveValue : 0; // curve size
  const leftX = 0;  //current left x
  const offsetX = left ? left : 0;
  const offsetY = top ? top : 0;
  const rightX = rectWidth; //current right x
  const leftTopY = -skewSize; //current left top y
  const rightTopY = skewSize; // current right top y
  const leftBottomY = leftTopY + rectHeight; // current left bottom y
  const rightBottomY = rightTopY + rectHeight; // current right bottom y
  const curveCenterX = rightX / 2; // current center x
  const curveTopCenterY = (leftTopY + rightTopY) / 2 - curveSize * 10; // current center top y
  const curveBottomCenterY = (leftBottomY + rightBottomY) / 2 - curveSize * 10; // current center bottom y

  const maxTop = (leftTopY > rightTopY) ? (leftTopY > -curveTopCenterY/2 ? leftTopY : -curveTopCenterY/2) : (rightTopY > -curveTopCenterY/2 ? rightTopY : -curveTopCenterY/2); //current maximum top y

  const maxBottom = (leftBottomY > rightBottomY) ? (leftBottomY > curveBottomCenterY ? leftBottomY : curveBottomCenterY + curveSize * 5) : (rightBottomY > curveBottomCenterY ? rightBottomY : curveBottomCenterY + curveSize * 5);//current maximum bottom y

  const nameArea = group.children.find(child => child.attrs.type === 'area_name'); //name area

  const shiftY = (maxBottom - rectHeight - maxTop) / 2; //group center vertical shift size
  
  rectangle.setAttrs({
    sceneFunc: function (context) {
      context.beginPath();
      context.lineTo(leftX, leftTopY);
      context.quadraticCurveTo(curveCenterX, curveTopCenterY, rightX, rightTopY)
      context.lineTo(rightX, rightBottomY);
      context.quadraticCurveTo(curveCenterX, curveBottomCenterY, leftX, leftBottomY)
      context.closePath(); // Close the path to create a rectangle
      context.fillStrokeShape(this); // Fill and stroke the shape
    },
    height: maxBottom + maxTop,
    width: rectangle.attrs.width,
    centerShift: shiftY,
    topShift: maxTop,
    offsetX: -offsetX,
    offsetY: -offsetY,
    positions: {
      x1y1: [leftX, leftTopY],
      x2y2: [curveCenterX, curveTopCenterY, rightX, rightTopY],
      x3y3: [rightX, rightBottomY],
      x4y4: [curveCenterX, curveBottomCenterY, leftX, leftBottomY]
    }
  })

  //layer border positions
  const borderLeftX = leftX - 10; //left x
  const borderRightX = rightX + 10 // right x
  const borderLeftTopY = leftTopY - 10 + curveSize/2 //left top y
  const borderRightTopY = rightTopY -10 + curveSize/2 + skewSize / 15 // right top y
  const borderRightBottomY = rightBottomY + 10 + curveSize/2 + skewSize / 15 // right bottom y
  const borderLeftBottomY = leftBottomY + 10 + curveSize/2;
  const borderCenterTopY = curveTopCenterY - 10 - curveSize / 2 // center top y
  const borderCenterBottomY = curveBottomCenterY +10 - curveSize / 2 //center bottom y

  border.setAttrs({
    sceneFunc: function (context) {
      context.beginPath();
      context.setLineDash([5, 5]);
      context.lineTo(borderLeftX, borderLeftTopY);
      context.quadraticCurveTo(curveCenterX, borderCenterTopY, borderRightX, borderRightTopY);
      context.lineTo(borderRightX, borderRightBottomY);
      context.quadraticCurveTo(curveCenterX, borderCenterBottomY, borderLeftX, borderLeftBottomY);
      context.closePath(); // Close the path to create a rectangle
      context.fillStrokeShape(this); // Fill and stroke the shape
    },
    offsetX: -offsetX,
    offsetY: -offsetY,
    width: borderRightX - 10,
    height: maxBottom + 20,
  })

  nameArea.setAttrs({
    y: border.attrs.y - nameArea.height() - maxTop + offsetY,
    x:  offsetX + rectWidth / 2
  });

  const updateConfigs = { ...group.attrs.configs, skew: skewSize, curveValue: curveSize }
  group.setAttrs({ configs: updateConfigs });
}

export const rotateAreaUtil = (mainGroups, rotation, configs) => {
  mainGroups.rotation(rotation);
  mainGroups.attrs.configs.rotation = rotation;

  const findAreaName = mainGroups.children.find(
    (child) => child.attrs.type === "area_name"
  );

  if (findAreaName) {
    if (rotation > 90) findAreaName.rotation(180);
    if (rotation < 90) findAreaName.rotation(0)
    if (rotation < -90) findAreaName.rotation(-180);
  }
}
















