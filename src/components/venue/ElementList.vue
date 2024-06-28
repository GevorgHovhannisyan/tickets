<template>
  <div v-if="!type">
    <div class="modal_title">Add Element</div>

    <div class="modal_description">Configure your event venue layout</div>

    <ul class="types_list">
      <li>
        <div class="type_block" @click="selectElement('section')">
          <img
            src="/img/sit_section.svg"
            alt=""
            title=""
            width="80"
            height="75"
          />
          <div class="type_name">Seated Section</div>
          <div class="type_desc">
            Build a reserved seating section with rows and seat numbers.
          </div>
        </div>
      </li>
      <li>
        <div class="type_block" @click="selectElement('area')">
          <!-- //@click="selectElement('area')" -->
          <img src="/img/area.svg" alt="" title="" width="80" height="75" />
          <div class="type_name">General Admission Area</div>
          <div class="type_desc">
            Create a region that is used for general admission.
          </div>
        </div>
      </li>
      <li>
        <div class="type_block" @click="selectElement('table')">
          <img
            src="/img/round_table.svg"
            alt=""
            title=""
            width="80"
            height="75"
          />
          <div class="type_name">Table</div>
          <div class="type_desc">
            Create a round table that seats between 2 and 16 guests.
          </div>
        </div>
      </li>
      <li>
        <div class="type_block" @click="submitForm({type: 'stage', data: {rotation: 0}})">
          <img src="/img/stage.svg" alt="" title="" width="80" height="75" />
          <div class="type_name">Stage</div>
          <div class="type_desc">Create Stage area</div>
        </div>
      </li>
      <li>
        <div class="type_block" @click="selectElement('text')">
          <img src="/img/text.svg" alt="" title="" width="80" height="75" />
          <div class="type_name">Text</div>
          <div class="type_desc">Create Text area for section name or description.</div>
        </div>
      </li>
    </ul>
  </div>

  <div v-else>
    <div v-if="type === 'section'">
      <AddSectionForm @closePopup="type = null" @submitSection="submitForm" />
    </div>
    <div v-if="type === 'area'">
      <AddAdmissionForm @submitArea="submitForm" @cancel="type = null" />
    </div>
    <div v-if="type === 'table'">
      <AddTableForm @submitTable="submitForm" @closePopup="type = null" />
    </div>
    <div v-if="type === 'text'">
      <AddTextForm @closePopup="type = null" @submitText="submitForm" />
    </div>
  </div>
</template>

<script>
// import { hasSceneInEdit } from '@/helpers/editBuilderSetup';
// import { hasScene } from '@/helpers/builderSetup';
// import {AppStage} from "@/core/AppStage";

export default {
  data() {
    return {
      type: null,
      hideScene: false
    };
  },
  methods: {
    selectElement(type) {
      this.type = type;
    },
    submitForm(data) {
      this.$emit("submitElement", data);
    },
  },
  // created(){
  //   const appStage = new AppStage();
  //   // this.hideScene = appStage.hasScene

  // }
};
</script>

<style></style>
