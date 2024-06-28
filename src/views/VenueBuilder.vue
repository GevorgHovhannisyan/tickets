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
    <div class="zoom_buttons">
      <div class="max_btn icon_plus" :class="{ inactive: maxDisabled }" @click="changeScale(0.1)"></div>
      <div class="min_btn icon_minus" :class="{ inactive: minDisabled }" @click="changeScale(-0.1)"></div>
      <div class="reset_btn icon_reset" @click="resetVenuePosition"></div>
    </div>
    <button
      class="hold_btn icon_hold"
      @click="toggleHold"
      :class="{ active: holded }"
    ></button>
    <div class="grid_buttons">
      <button class="grid_btn" @click="toggleGrid()"></button>
      <button v-if="gridView" class="grid_plus" :class="{ inactive: gridSize == maxZoomGrid }" @click="zoomInGrid()">+</button>
      <button v-if="gridView" class="grid_minus" :class="{ inactive: gridSize == minZoomGrid }" @click="zoomOutGrid()">-</button>
    </div>

    <div class="builder_btns">
      <button
        class="secondary_btn"
        aria-label="add section"
        @click="addElementToVenue = true"
      >
        Add
      </button>
      <button class="primary_btn" aria-label="save" @click="saveVenue">
        Save Venue
      </button>
    </div>
    <div class="build_area">
      <div id="venue-builder"></div>
    </div>

    <div class="build_area" v-show="false">
      <div id="add-venue-builder-skeleton"></div>
    </div>

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

    <Modal
      class="confirm_modal"
      @closePopup="deleteElementPopup = false"
      :openPopup="deleteElementPopup"
    >
      <div class="modal_description">Do you want to delete</div>
      <span class="divider"></span>

      <div class="form_btns">
        <button
          class="secondary_btn"
          aria-label="cancel"
          @click="deleteElementPopup = false"
        >
          Cancel
        </button>
        <button class="primary_btn" aria-label="delete" @click="deleteElement">
          Delete
        </button>
      </div>
    </Modal>

    <Modal
      class="create_modal"
      @closePopup="addElementToVenue = false"
      :openPopup="addElementToVenue"
      :showClose="true"
    >
      <AddElementToVenue
        @closePopup="addElementToVenue = false"
        @appendElementToBuilder="appendElementToBuilder"
      ></AddElementToVenue>
    </Modal>

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

    <!-- AREA -->

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

    <!-- AREA END -->

    <!-- stage -->
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
    <!-- stage end-->
    <!-- text -->

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
  createSeatedSection,
  deleteElement,
  updateStageSizes,
  createTableSeats,
  createScene,
  createText,
  createAdmissionArea,
  adjustScale,
  holdZoomOut,
  stageScaleWheel
} from "@/helpers/builderSetup";
import {
  deselectSeats,
  deselectGroupSeats,
} from "@/helpers/seatUtils"
import {
  cancelChanges,
  deleteSection,
} from "@/helpers/section/_generator";
import {
  cancelTableChanges,
  deleteTableElement,
} from "@/helpers/table/generator";
import {
  deleteAreaElement,
  cancelAreaChanges,
} from "@/helpers/area/generator";
import {
  deleteSceneElement,
  cancelSceneChanges,
} from "@/helpers/stage/generator";
import {
  deleteTextElement,
  cancelTextChanges,
} from "@/helpers/text/generator";
import {
  ActionButtonsGroup,
  removeUnnecessaryElements,
  stopListeningToShiftKeys,
  getSkeletone,
  getStageJson,
  countVenueSize,
  moveElements
} from "@/helpers/utils";
import { AppStage } from "@/core/AppStage";

export default {
  data() {
    return {
      createVenuePopup: false,
      addElementToVenue: false,
      editSectionPopup: false,
      editSeatPopup: false,
      deletedElementId: null,
      deletedElementType: null,
      deleteElementPopup: null,
      editSectionItem: null,
      editSeatItem: null,

      editTablePopup: false,
      editTableItem: null,

      editTableSeatPopup: false,
      editTableSeatItem: null,

      editAreaPopup: false,
      editAreaItem: null,

      editScenePopup: false,
      editSceneItem: null,

      editTextPopup: false,
      editTextItem: null,

      holded: false,
      maxDisabled: false,
      minDisabled: false,

      gridView: false,
      gridSize: 40,
      maxZoomGrid: 70,
      minZoomGrid: 10
    };
  },
  computed: {
    ...mapGetters([
      "venue_configs",
      "venue",
      "admin",
      "venues",
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
  mounted() {
    if(document.body.classList.contains('grid_view')) {
      this.gridView = true
    }

    AppStage.init('venue-builder')
    setupBuilder("venue-builder", this);

    window.addEventListener("resize", this.handleWindowResize);

    if (this.venue_configs) {
      this.createElement();
    } else {
      this.$router.push("/venue").catch(() => {});
    }

    document.querySelector("#app").style.background = "black";
  },
  methods: {
    ...mapActions(["createVenue"]),
    createElement() {
      const { type, data } = this.venue_configs;

      switch (type) {
        case "section":
          const { mainGroup, stage } = createSeatedSection(data, this);

          const payload = {

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
        rowDirection: sectionData.rowDir,
        seatDirection: sectionData.seatDir,
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
    deleteConfirmation(id, type) {
      this.deletedElementId = id;
      this.deletedElementType = type;
      this.deleteElementPopup = true;
    },
    deleteElement() {
      // const { mainGroups } = deleteElement(this.deletedElementId);
      if (this.deletedElementType === "section") {
        deleteSection(this.deletedElementId);
      } else if (this.deletedElementType === "table") {
        deleteTableElement(this.deletedElementId);
      } else if (this.deletedElementType === "area") {
        deleteAreaElement(this.deletedElementId);
      } else if ((this.deletedElementType === "stage")) {
        deleteSceneElement(this.deletedElementId);
      } else if ((this.deletedElementType === "text")) {
        deleteTextElement(this.deletedElementId);
      }

      // this.$store.commit("DELETE_LAYER", this.deletedElementId);
      this.deleteElementPopup = false;
      const actionsButtons = new ActionButtonsGroup();
      actionsButtons.hideActions();
    },

    appendElementToBuilder(configs) {
      this.$store.commit("SET_BUILDER_CONFIGS", configs);
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
    closeAreaEdit() {
      this.editAreaPopup = false;
      cancelAreaChanges(this.editAreaItem);
    },
    closeSceneEdit() {
      this.editScenePopup = false;
      cancelSceneChanges(this.editSceneItem);
    },
    closeTextEdit() {
      this.editTextPopup = false;
      cancelTextChanges(this.editTextItem, stage);
    },
    selectSecSeat(layerId, seat, rowId, configs) {
      this.editSeatItem = { seat, layerId, rowId, configs };
      this.editSeatPopup = true;
    },
    selectTableSeat(layerId, seat, configs) {
      this.editTableSeatItem = { seat, layerId, configs };
      this.editTableSeatPopup = true;
    },
    async saveVenue() {
      removeUnnecessaryElements();
      const { stageJson, image } = getStageJson();
      const jsons = getSkeletone("add-venue-builder-skeleton");
      const venueName = this.venue.name;
      const adminId = this.getAdminId;
      const payload = {
        user_id: adminId,
        name: venueName,
        datajson: JSON.parse(stageJson),
        skeletonjson: JSON.parse(jsons),
        image: null,
      };
    
      const filterVenues = this.venues.filter((v) =>
        v.name.includes(venueName)
      );

      if (filterVenues.length) {
        let maxNumber = 0;
        filterVenues.forEach((obj) => {
          const slug = obj.slug;
          const number = parseInt(slug.split("-")[1]);

          if (!isNaN(number) && number > maxNumber) {
            maxNumber = number;
          }
        });

        const name = venueName.toLowerCase().replace(/\s+/g, "");

        payload.slug = `${name}-${maxNumber + 1}`;
      } else {
        payload.slug = venueName.toLowerCase().replace(/\s+/g, "");
      }

      stopListeningToShiftKeys();

      try {
        await this.createVenue(payload);
        this.$router.push("/venue").catch(() => {});
      } catch (error) {}
    },
    handleWindowResize() {
      countVenueSize('reposition');
    },
    getInvalidImage() {
      return this.invalid_image;
    },
    changeScale(value) {
      const isMinus = value === -0.1;
      adjustScale(isMinus);
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
    resetVenuePosition() {
      countVenueSize('reposition');
    }
  },
  watch: {
    editSeatPopup(val, oldVal) {
      if (!val) {
        deselectSeats(this.editSectionItem.layerId);
      }
    },
    editTableSeatPopup(val, oldVal) {
      if (!val) {
        deselectSeats(this.editTableItem.layerId);
      }
    },
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleWindowResize);
    document.removeEventListener('keydown', moveElements);
    document.querySelector("#app").style.background = "none";
  },
};
</script>

