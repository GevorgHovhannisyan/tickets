<template>
    <div class="form_fields">
        <div class="form_btns top_btns">
            <button class="secondary_btn" @click="cancelChanges">Cancel</button>
            <button class="primary_btn" @click="updateScene">Submit</button>
        </div>

        <div class="field_block">
            <span class="field_name">Rotation</span>
            <range-slider class="slider" min="-180" max="180" step="10" v-model="editData.rotation" @input="changeRotation">
            </range-slider>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from "vuex";
    import RangeSlider from "vue-range-slider";
    import {
        cancelSceneChanges,
        rotateScene,
        updateSceneStage
    } from "@/helpers/stage/generator";

    import {
        deselectGroup
    } from "@/helpers/utils";

    export default {
        props: {
            editScene: {
                type: Object,
                default: () => { },
            },
            popup: {
                type: Boolean,
                default: false,
            },
        },
        watch: {
            popup(opened) {
            if (!opened) {
                cancelSceneChanges(this.editScene);
            }
            },
        },
        data() {
            return {
                editData: {},
            };
        },
        created() {
            const data = this.editScene
            this.editData.rotation = data.rotation
                ? data.rotation
                : 0;

        },
        methods: {
            editSceneHelper() {
                const { layerId } = this.editScene;
                const payload = {
                    sceneData: this.editScene,
                    newData: this.editData,
                };
                updateSceneStage(layerId, payload);
            },
            updateScene() {
                deselectGroup();
                this.$emit("closePopup");
            },
            cancelChanges() {
                cancelSceneChanges(this.editScene)
                this.$emit("closePopup", this.editScene);
            },
             changeRotation() {
                rotateScene(this.editScene.layerId, this.editData.rotation, this.editData);
            },
        },
        components: {
            RangeSlider,
        },
    }
</script>
