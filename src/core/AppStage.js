import Konva from "konva";
import {uid} from "uid";

class AppStage {
    static instance = null;

    constructor() {
        if (AppStage.instance !== null) {

            return AppStage.instance;
        }
        AppStage.instance = this;
    }

    static init(container) {
        AppStage.instance = new Konva.Stage({
            container: container,
            width: window.innerWidth,
            height: window.innerHeight,
        });

        const mainLayer = new Konva.Layer({
            id: uid(6),
        });

        AppStage.instance.add(mainLayer);
        AppStage.instance.selected = []
    }

    static addKey(key, value) {
        AppStage.instance[key] = value;
    }

    static addArr(value) {
        AppStage.instance.selected.push(value);
    }

    static resetSelected() {
        AppStage.instance.selected = [];
    }

    static setAttrs(attrs = {}) {
        AppStage.instance.attrs = {...AppStage.instance.attrs, ...attrs};
    }

    static add(layer) {
        AppStage.instance.add(layer);
    }

    static reset() {
        AppStage.instance = null;
    }

    static scale(scaleSize) {
        AppStage.instance.scale(scaleSize);
    }

    static position(coords) {
        AppStage.instance.position(coords);
    }

    static visible(type) {
        AppStage.instance.visible(type);
    }

    getPointerPosition() {
        return AppStage.instance.getPointerPosition();
    }
}

export { AppStage };
