import Konva from "konva";

export class SeatsGroups {
    map = {};

    add(konva, id) {
        this.map[id] = konva;
    }

    get(id) {
        return this.map[id];
    }

    remove(id) {
        delete this.map[id];
    }

    clear() {
        this.map = {};
    }

    getAll() {
        return this.map;
    }

    getLength() {
        return Object.keys(this.map).length;
    }

    has(id) {
        return this.map.hasOwnProperty(id);
    }

    update(id, konva) {
        this.map[id] = konva;
    }
}

export const seatsGroups = new SeatsGroups();