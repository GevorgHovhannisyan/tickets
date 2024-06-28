<template>
    <div class="text_form">
        <div class="modal_title">New Text Block</div>
        <div class="modal_description">
            Write your text here. Maximum length is 100
        </div>
        <ValidationObserver
            ref="create_text_block"
            slim
            v-slot="{ handleSubmit, reset }"
        >
            <form
                class="create_text"
                @submit.prevent="handleSubmit(submitText)"
                @reset.prevent="reset"
                autocomplete="off"
            >
                <div class="form_fields">
                    <div class="field_block">
                        <ValidationProvider
                        name="blt"
                        v-slot="{ errors }"
                        slim
                        rules="required"
                        >
                        <label :class="{ has_error: errors[0] }">
                            <span class="field_name">Text</span>
                            <textarea name="text" maxlength="100" v-model="text.text" ></textarea>
                            <span class="error_message">{{ errors[0]? "Required field" : "" }}</span>
                        </label>
                        </ValidationProvider>
                    </div>
                </div>
                <div class="form_btns">
                    <a class="secondary_btn" @click="$emit('closePopup')">Cancel</a>
                    <button class="primary_btn" aria-label="add text">
                        Add Text
                    </button>
                </div>
            </form>
        </ValidationObserver>
    </div>
</template>

<script>

export default {
  methods: {
    submitText() {

      this.$emit("submitText", {
        type: "text",
        data: { ...this.text },
      });
    },
  },
  data() {
    return {
      text: {
        fontSize: 20,
        rotation: 0,
        alignment: 'center',
        spacing: 0,
        fontWeight: 400,
        lineHeight: 1.33
      },
    };
  },
};
</script>