export const TextParams = {
  FONT_REGULAR: "Lato-Regular",
  FONT_BOLD: "Lato-Bold",
  ALIGN_CENTER: "center",
  SIZE_SM: 12,
  SIZE_MD: 14,
  SIZE_XL: 27,
}

export const SEAT = {
  size: 35,
  margin: 10,
  color: "white",
  strokeWidth: 1,
  fontSize: TextParams.SIZE_MD,
};

export const buttonSize = 45;

export const buttonsList = [
  {
    imageUrl: "/img/edit_icon2.svg",
    type: "editAction",
    x: 0,
    y: 0,
  },
  {
    imageUrl: "/img/copy_icon2.svg",
    type: "copyAction",
    x: 0,
    y: 0,
  },
  {
    imageUrl: "/img/freeze_icon.svg",
    type: "freezeAction",
    x: 0,
    y: 0,
  },
  {
    imageUrl: "/img/sort_icon2.svg",
    type: "sortAction",
    x: 0,
    y: 0,
  },
  {
    imageUrl: "/img/delete_icon2.svg",
    type: "deleteAction",
    x: 0,
    y: 0,
  }
]

export const buttonsOrder = {
  "section": ['editAction', 'copyAction', 'freezeAction', 'sortAction', 'deleteAction'],
  "round": ['editAction', 'copyAction', 'freezeAction', 'deleteAction'],
  "square": ['editAction', 'copyAction', 'freezeAction', 'deleteAction'],
  "rectangle": ['editAction', 'copyAction', 'freezeAction', 'deleteAction'],
  "area": ['editAction', 'copyAction', 'freezeAction', 'deleteAction'],
  "text": ['editAction', 'copyAction', 'freezeAction', 'deleteAction'],
  "stage": ['editAction', 'copyAction', 'freezeAction', 'deleteAction'],
}


