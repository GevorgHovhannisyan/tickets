import { generateSection, clearBorder } from "./_generator";
import { bindRowsAndSeats } from "./_utils";

const margeSectionData = (currentData, defaultData) => {
  let rowSeatData = currentData;
  for(let i = 0; i < currentData.length; i++) {
    const currentRow = currentData[i];
    const currentRowSeats = currentRow.seats;
    const defaultRow = defaultData[i];
    const defaultRowSeats = defaultRow.seats;
    
    if(currentRow.key !== defaultRow.key) {
      let rowLabel = currentRow.key ? currentRow.key : '';
      rowSeatData[i].editedKey = rowLabel;
      rowSeatData[i].key = rowLabel;
    }

    for(let j = 0; j < currentRowSeats.length; j++) {
      const currentSeat = currentRowSeats[j];
      const defaultSeat = defaultRowSeats[j];
      if(currentSeat.number && currentSeat.number !== defaultSeat.number) {
        rowSeatData[i].seats[j].editedNumber = currentSeat.number;
      }
    }
  };
  return { rowSeatData };
}

export const createSection = (configs, component, position, id, seats) => {

  const rowSeatData = seats ? margeSectionData(seats, bindRowsAndSeats(configs).rowSeatData).rowSeatData : bindRowsAndSeats(configs).rowSeatData;

  const { mainGroup } = generateSection(rowSeatData, configs, component, position, id);
  return { mainGroup };
};

// Todo fix this line: Cannot resolve symbol 'clearBorder' 
export const clearSectionBorders = () => clearBorder();

