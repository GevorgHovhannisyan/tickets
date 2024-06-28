<template>
  <div class="builder_main">
    <span v-if="gridView" class="grid">
      <span :style="{
          'background-image': 'linear-gradient(to right, #ffffff 0 1px, transparent 1px ' + gridSize + 'px)',
          'background-repeat': 'repeat-x',
          'background-size': gridSize + 'px 100%'
      }">
      </span>
      <span :style="{
          'background-image': 'linear-gradient(to bottom, #ffffff 0 1px, transparent 1px ' + gridSize + 'px)',
          'background-repeat': 'repeat-y',
          'background-size': '100% ' + gridSize + 'px'
      }">
      </span>
    </span>
    <div class="name_edit" v-if="edit_venue_configs">
      <div class="icon_edit edit_btn" @click="editVenueName"></div>
      <div class="name_block">
        {{ edit_venue_configs.name }}
      </div>
    </div>
    <div class="zoom_buttons">
      <div class="max_btn icon_plus" :class="{inactive: maxDisabled}" @click="changeScale(0.1)"></div>
      <div class="min_btn icon_minus" :class="{inactive: minDisabled}" @click="changeScale(-0.1)"></div>

      <div class="reset_btn icon_reset" @click="resetVenuePosition"></div>
    </div>

    <button class="hold_btn icon_hold" :class="{active: holded}" @click="toggleHold"></button>
    <div class="grid_buttons">
      <button class="grid_btn" @click="toggleGrid()"></button>
      <button v-if="gridView" class="grid_plus" :class="{ inactive: gridSize == maxZoomGrid }" @click="zoomInGrid()">+</button>
      <button v-if="gridView" class="grid_minus" :class="{ inactive: gridSize == minZoomGrid }" @click="zoomOutGrid()">-</button>
    </div>


    <div class="builder_btns">
      <button class="secondary_btn" aria-label="add section" @click="addElementToVenue = true">
        Add
      </button>
      <button class="primary_btn" aria-label="save" @click="updateVenueStage(false)">
        Save Venue
      </button>

      <button class="primary_btn" aria-label="save" @click="updateVenueStage(true)">
        Save and Exit
      </button>

      <button class="primary_btn" aria-label="save" @click="exitToList">
        Discard and close
      </button>
    </div>

    <div class="build_area">
      <div id="edit-venue-builder"></div>
    </div>

    <div class="build_area" v-show="false">
      <div id="venue-builder-dirty"></div>
    </div>
    <div class="build_area" v-show="false">
      <div id="venue-builder-skeleton"></div>
    </div>

    <Modal
      @closePopup="closeTableEdit"
      :openPopup="editTablePopup"
      class="edit_modal"
    >
      <EditTable
        @closeModal="editTablePopup = false"
        @cancel="closeTableEdit"
        :editTable="editTableItem"
      ></EditTable>
    </Modal>

    <Modal class="confirm_modal" @closePopup="deleteElementPopup = false" :openPopup="deleteElementPopup">
      <div class="modal_description">Do you want to delete</div>
      <span class="divider"></span>

      <div class="form_btns">
        <button class="secondary_btn" aria-label="cancel" @click="deleteElementPopup = false">
          Cancel
        </button>
        <button class="primary_btn" aria-label="delete" @click="deleteElement">
          Delete
        </button>
      </div>
    </Modal>

    <Modal
      @closePopup="editTableSeatPopup = false"
      :openPopup="editTableSeatPopup"
      class="edit_modal"
    >
      <EditTableSeat
        @closeModal="editTableSeatPopup = false"
        :editSeat="editTableSeatItem"
      ></EditTableSeat>
    </Modal>

    <Modal
      @closePopup="closeEditSection"
      :openPopup="editSectionPopup"
      class="edit_modal"
    >
      <EditSection
        @closePopup="editSectionPopup = false"
        :editItem="editSectionItem"
        :popup="editSectionPopup"
      ></EditSection>
    </Modal>

    <Modal
      @closePopup="editSeatPopup = false"
      :openPopup="editSeatPopup"
      class="edit_modal"
    >
      <EditSeat
        @closeModal="editSeatPopup = false"
        :editSeat="editSeatItem"
      ></EditSeat>
    </Modal>

    <!-- Area -->
    <Modal
      @closePopup="closeAreaEdit"
      :openPopup="editAreaPopup"
      class="edit_modal"
    >
      <EditArea
        @closePopup="editAreaPopup = false"
        :editArea="editAreaItem"
        :popup="editAreaPopup"
      ></EditArea>

    </Modal>

    <Modal class="create_modal" @closePopup="addElementToVenue = false" :openPopup="addElementToVenue" :showClose="true">
      <AddElementToVenue @closePopup="addElementToVenue = false" @appendElementToBuilder="appendElementToBuilder">
      </AddElementToVenue>
    </Modal>

    <Modal class="create_modal" @closePopup="editVenueNamePopup = false" :openPopup="editVenueNamePopup">
      <ValidationObserver ref="update_venue_name" slim v-slot="{ handleSubmit, reset }">
        <form class="update_venue_name" @submit.prevent="handleSubmit(updateVenueName)" @reset.prevent="reset"
          autocomplete="off">
          <div class="modal_title">Update Venue Name</div>

          <div class="field_block">
            <ValidationProvider name="name" v-slot="{ errors }" slim rules="required">
              <label :class="{ has_error: errors[0] }">
                <span class="field_name">Venue Name</span>
                <input type="text" name="name" v-model="venue_name" />
                <span class="error_message">{{ errors[0] }}</span>
              </label>
            </ValidationProvider>
          </div>
          <button class="primary_btn" type="submit">Update</button>
        </form>
      </ValidationObserver>
    </Modal>

    <Modal
      @closePopup="closeSceneEdit"
      :openPopup="editScenePopup"
      class="edit_modal"
    >
      <EditScene
        @closePopup="editScenePopup = false"
        :editScene="editSceneItem"
        :popup="editScenePopup"
      >
      </EditScene>
    </Modal>

    <Modal
      @closePopup="closeTextEdit"
      :openPopup="editTextPopup"
      class="edit_modal"
    >
      <EditText
        @closePopup="editTextPopup = false"
        :editText="editTextItem"
        :popup="editTextPopup"
      >
      </EditText>
    </Modal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import {
  setupBuilder,

  deleteElement,
  scaleStageBtn,
  stageScaleWheel,
  resetValues,
  holdZoomOut,
  createScene,
  createText,
  createAdmissionArea,
  createSeatedSection,
  createTableSeats
} from "@/helpers/editBuilderSetup";

import {
  countVenueSize,
  getSkeletone,
  getStageJson,
  moveElements
} from  "@/helpers/utils";
import {
  cancelAreaChanges
} from "@/helpers/area/generator";
import {
  deselectTableSeats,
  cancelTableChanges
} from "@/helpers/table/generator";
import {
  ActionButtonsGroup, removeUnnecessaryElements, stopListeningToShiftKeys
} from "@/helpers/utils";
import {AppStage} from "@/core/AppStage";

export default {
  data() {
    return {
      createVenuePopup: false,
      addElementToVenue: false,
      editSectionPopup: false,
      editSeatPopup: false,
      deletedElementId: null,
      deleteElementPopup: null,
      deletedElementType: null,
      editSectionItem: null,
      editSeatItem: null,
      editTablePopup: false,
      editTableItem: null,
      editTableSeatPopup: false,
      editTableSeatItem: null,
      venue_name: null,
      editVenueNamePopup: false,
      editAreaPopup: false,
      editAreaItem: null,
      holded: false,
      maxDisabled: false,
      minDisabled: false,
      editSceneItem: null,
      editScenePopup: false,
      editTextItem: null,
      editTextPopup: false,
      gridView: false,
      gridSize: 40,
      maxZoomGrid: 70,
      minZoomGrid: 10
    };
  },
  computed: {
    ...mapGetters([
      "edit_venue_configs",
      "venue",
      "admin",
      "venues",
      "new_config_venue",
      "invalid_image",
    ]),
    getAdminId() {
      return this.admin && this.admin.user
        ? this.admin.user.id
        : this.admin && this.admin.id
          ? this.admin.id
          : localStorage.getItem("admin")
            ? JSON.parse(localStorage.getItem("admin")).id
            : null;
    },
  },
  async mounted() {
    if(document.body.classList.contains('grid_view')) {
      this.gridView = true
    }

    document.querySelector('#app').style.background = 'black'

    const { id } = this.$route.params;

    if (id) {
      const editImage = new Image();
      editImage.src = "/img/invalid.svg";
      let invalidImage;

      editImage.onload = () => {
        invalidImage = editImage;
        this.$store.commit("SET_INVALID_IMAGE", invalidImage);
      };

      try {
        await this.getVenue(+id);
      } catch (error) {
        const res = error.response
        const message = res && res.data.message ? res.data.message : null;

        if (message && message === "Venue Does Not Exist") {
          this.$router.push("/not-found").catch(() => { });
          return false
        }
      }

      if (this.edit_venue_configs) {
        AppStage.init('edit-venue-builder');
        setupBuilder("edit-venue-builder", this.edit_venue_configs, this);
        this.createElement();
      } else {
        this.$router.push("/venue").catch(() => { });
      }
    }

    window.addEventListener("resize", () => {
      countVenueSize('reposition');
    });
  },
  methods: {
    ...mapActions(["createVenue", "getVenue", "updateVenue", "resetStoreStage"]),
    createElement() {

      const type = this.new_config_venue?.type;
      const  data = this.new_config_venue?.data;

      // Todo add cases to constant
      switch (type) {
        case "section":
          const { mainGroup, stage } = createSeatedSection(data, this);

          const payload = {
            configs: this.new_config_venue,
            mainGroup: mainGroup,
          };

          this.$store.commit("SET_MAIN_GROUP", payload);
          break;
        case "area":
          createAdmissionArea(data, this);
          break;
        case "table":
          createTableSeats(data, this);
          break;
        case "stage":
          createScene(data, this);
          break;
        case "text":
          createText(data, this);
          break;
        default:
          break;
      }
    },
    editSection(layerId, configs, sectionData) {
      this.editSectionPopup = true;

      const payload = {
        ...configs,
        layerId,
        rowDirection: sectionData.attrs.rowDir,
        seatDirection: sectionData.attrs.seatDir,
      };

      this.editSectionItem = payload;
    },
    editTable(layerId, configs, tableData) {
      this.editTablePopup = true;

      const payload = {
        ...configs,
        layerId,
        tableData,
      };

      this.editTableItem = payload;
    },
    editArea(layerId, configs, tableData) {
      this.editAreaPopup = true;

      const payload = {
        ...configs,
        layerId,
        tableData,
      };

      this.editAreaItem = payload;
    },
    deleteConfirmation(id, type) {
      this.deletedElementId = id;
      this.deletedElementType = type;
      this.deleteElementPopup = true;
    },
    deleteElement() {
      deleteElement(this.deletedElementId);
      this.deleteElementPopup = false;
      const actionsButtons = new ActionButtonsGroup();
      actionsButtons.hideActions();
    },
    appendElementToBuilder(configs) {
      this.$store.commit("SET_EDIT_CONFIGS", configs);
      this.addElementToVenue = false;
      this.createElement();
    },
    closeEditSection() {
      // const { layerId } = this.editSectionItem;
      this.editSectionPopup = false;
      cancelChanges(this.editSectionItem);
      // deselectSection(layerId);
    },
    closeTableEdit() {
      this.editTablePopup = false;
      cancelTableChanges(this.editTableItem);
    },
    selectSecSeat(layerId, seat, rowId, configs) {
      this.editSeatItem = { seat, layerId, rowId, configs };
      this.editSeatPopup = true;
    },
    selectTableSeat(layerId, seat, configs) {
      this.editTableSeatItem = { seat, layerId, configs };
      this.editTableSeatPopup = true;
    },
    async updateVenueStage(exit) {
      if(exit) {
        removeUnnecessaryElements();
      }
      const { stageJson, image } = getStageJson();
      const jsons = getSkeletone("venue-builder-skeleton")

      const payload = {
        id: this.edit_venue_configs.id,
        name: this.edit_venue_configs.name,
        datajson: JSON.parse(stageJson),
        skeletonjson: JSON.parse(jsons),
        image: null,
      };

      try {
        await this.updateVenue(payload);

        if (exit) {
          stopListeningToShiftKeys();
          this.$router.push("/venue").catch(() => { });
        }
      } catch (error) { }
    },
    editVenueName() {
      this.venue_name = this.edit_venue_configs.name;
      this.editVenueNamePopup = true;
    },
    updateVenueName() {
      this.edit_venue_configs.name = this.venue_name;
      this.editVenueNamePopup = false;
    },
    getInvalidImage() {
      return this.invalid_image;
    },
    closeAreaEdit() {
      this.editAreaPopup = false;
      cancelAreaChanges(this.editAreaItem);
    },
    exitToList() {
      stopListeningToShiftKeys();
      this.$store.commit("SHOW_LOADING", true);

      setTimeout(() => {
        this.$router.push('/venue').catch(() => { })
      }, 200);
    },
    changeScale(value){
      const isMinus = value === -0.1;
      scaleStageBtn(value, isMinus);
    },
     toggleGrid() {
      document.body.classList.toggle("grid_view");
      this.gridView = !this.gridView
    },
    zoomInGrid() {
      this.gridSize += 10
    },
    zoomOutGrid() {
      this.gridSize -= 10
    },
    toggleHold() {
      this.holded = !this.holded;
      holdZoomOut(this.holded);
    },
    closeSceneEdit(){},
    closeTextEdit(){},
    editScene(layerId, configs, tableData) {
      this.editScenePopup = true;

      const payload = {
        ...configs,
        layerId,
        tableData,
      };

      this.editSceneItem = payload;
    },
    editText(layerId, configs, tableData) {
      this.editTextPopup = true;

      const payload = {
        ...configs,
        layerId,
        tableData,
      };

      this.editTextItem = payload;
    },
    resetVenuePosition() {
      countVenueSize('reposition');
    }
  },
  // watch: {
  //   editSeatPopup(val, oldVal) {
  //     if (!val) {
  //       deselectTableSeats(this.editSectionItem.layerId);
  //     }
  //   },
  //   editTableSeatPopup(val, oldVal) {
  //     if (!val) {
  //       deselectTableSeats(this.editTableItem.layerId);
  //     }
  //   },
  // },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleWindowResize);
    document.removeEventListener('keydown', moveElements);
    document.querySelector('#app').style.background = "none"
    resetValues()
    this.resetStoreStage()
  },
};
</script>

