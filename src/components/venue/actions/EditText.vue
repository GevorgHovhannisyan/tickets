<template>
    <ValidationObserver
        ref="edit_text_form"
        slim
        v-slot="{ handleSubmit, reset }"
    >
        <form
            class="edit_text_form"
            @submit.prevent="handleSubmit(saveSectionChanges)"
            @reset.prevent="reset"
            autocomplete="off"
        >
            <div class="form_fields">
                <div class="form_btns top_btns">
                    <button type="button" class="secondary_btn" @click="cancelChanges">Cancel</button>
                    <button aria-label="add section" class="primary_btn">Save</button>
                </div>
                <div class="field_block">
                <ValidationProvider
                    name="text"
                    v-slot="{ errors }"
                    slim
                    rules="required"
                >
                    <label :class="{ has_error: errors[0] }">
                    <span class="field_name">Text</span>
                    <textarea
                        name="name"
                        maxlength="100"
                        @input="updateStage"
                        v-model="editData.text"
                    >
                    </textarea>
                    <span class="error_message">{{
                        errors[0] ? "Required field" : ""
                    }}</span>
                    </label>
                </ValidationProvider>
                </div>
                <div class="field_block">
                    <span class="field_name">Font Size</span>
                    <range-slider class="slider" min="14" max="40" step="1" v-model="editData.fontSize" @input="updateStage">
                    </range-slider>
                </div>
                <div class="field_block">
                    <span class="field_name">Line Height</span>
                    <range-slider class="slider" min="1" max="2" step="0.1" v-model="editData.lineHeight" @input="updateStage">
                    </range-slider>
                </div>
                <div class="field_block">
                    <span class="field_name">Letter Spacing</span>
                    <range-slider class="slider" min="-1" max="5" step="0.5" v-model="editData.spacing" @input="updateStage">
                    </range-slider>
                </div>
                <div class="field_block">
                    <span class="field_name">Rotation</span>
                    <range-slider class="slider" min="-180" max="180" step="10" v-model="editData.rotation" @input="updateStage">
                    </range-slider>
                </div>
                <span class="divider"></span>
                <div class="field_block half_field">
                    <div class="check_group">
                        <label>
                            <input
                                type="checkbox"
                                @change="updateStage"
                                v-model="editData.upperCase"
                            />
                            <span class="check_btn">Uppercase</span>
                        </label>
                    </div>
                </div>
                <div class="field_block half_field">
                    <div class="check_group">
                        <label>
                            <input
                                type="checkbox"
                                @change="updateStage"
                                v-model="editData.bold"
                            />
                            <span class="check_btn">Bold</span>
                        </label>
                    </div>
                </div>
            </div>
        </form>
    </ValidationObserver>
</template>

<script>
    import { mapGetters } from "vuex";
    import RangeSlider from "vue-range-slider";
    import {
        cancelTextChanges,
        updateText,
    } from "@/helpers/text/generator";

    import {
        deselectGroup
    } from "@/helpers/utils"

    export default {
        props: {
            editText: {
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
                cancelTextChanges(this.editText);
            }
            },
        },
        data() {
            return {
                editData: {},
            };
        },
        created() {
            this.editData = _.cloneDeep(this.editText);
        },
        methods: {
            // editTextHelper() {
            //     const { layerId } = this.editText;
            //     const payload = {
            //         textData: this.editText,
            //         newData: this.editData,
            //     };
            //     updateText(layerId, payload);
            // },
            saveSectionChanges() {
                deselectGroup();
                this.$emit("closePopup");
            },

            cancelChanges() {
                cancelTextChanges(this.editText)
                this.$emit("closePopup");
            },

            updateStage() {
                const { layerId } = this.editText;
                const configs = this.editData;
                updateText(layerId, configs);
            },
        },
        components: {
            RangeSlider,
        },
    }
</script>
