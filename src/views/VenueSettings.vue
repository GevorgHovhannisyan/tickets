<template>
  <div class="builder_main">
    <div class="venues_page">
      <h1 class="page_title">my venues</h1>
      <div class="btn_block">
        <button class="venue_btn" @click="createVenuePopup = true">
          NEW VENUE
        </button>
        <!-- <button class="venue_btn" v-else @click="addElementToVenue = true">Add element</button> -->
      </div>
      <div class="venues_list" v-if="venues.length">
        <ul class="list_inner">
          <li v-for="(venue, index) in venues" :key="index">
            <div class="venue_name">
              {{ venue.name }}
            </div>

            <div class="venue_actions">
              <button
                class="icon_edit copy_btn"
                aria-label="copy venue"
                @click="editVenue(venue)"
              >
                EDIT
              </button>
              <button
                class="icon_copy copy_btn"
                aria-label="copy venue"
                @click="copyVenue(venue)"
              >
                COPY
              </button>

              <button
                class="icon_delete delete_btn"
                aria-label="delete venue"
                @click="
                  deleteVenueID = venue.id;
                  deleteVenuePopup = true;
                "
              >
                DELETE
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <Modal
      class="create_modal"
      :showClose="true"
      @closePopup="createVenuePopup = false"
      :openPopup="createVenuePopup"
    >
      <CreateVenueForm @submitVenue="submitVenue"></CreateVenueForm>
    </Modal>

    <Modal
      class="create_modal"
      :showClose="true"
      @closePopup="addElementToVenue = false"
      :openPopup="addElementToVenue"
    >
      <AddElementToVenue
        @closePopup="addElementToVenue = false"
        @appendElementToBuilder="appendElementToBuilder"
      >
      </AddElementToVenue>
    </Modal>

    <Modal
      class="confirm_modal"
      :showClose="true"
      @closePopup="deleteVenuePopup = false"
      :openPopup="deleteVenuePopup"
    >
      <div class="modal_description">Do you want to delete the venue?</div>
      <span class="divider"></span>

      <div class="form_btns">
        <button
          class="secondary_btn"
          @click="deleteVenuePopup = false"
          aria-label="cancel"
        >
          CANCEL
        </button>
        <button
          class="primary_btn"
          @click="removeVenue"
          aria-label="delete venue"
        >
          DELETE
        </button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
export default {
  data() {
    return {
      createVenuePopup: false,
      addElementToVenue: false,
      deleteVenuePopup: false,
      deleteVenueID: null,
    };
  },
  methods: {
    ...mapActions([
      "saveVenueConfigs",
      "getVenues",
      "getVenue",
      "deleteVenue",
      "createVenue",
    ]),
    async submitVenue(venue) {
      try {
        await this.saveVenueConfigs(venue);
        this.createVenuePopup = false;
        this.addElementToVenue = true;
      } catch (error) {}
    },
    appendElementToBuilder(configs) {
      this.$store.commit("SET_BUILDER_CONFIGS", configs);
      this.$router.push("/venue-builder").catch(() => {});
      this.addElementToVenue = false;
    },
    async removeVenue() {
      const id = this.deleteVenueID;

      try {
        await this.deleteVenue(id);
        this.deleteVenuePopup = false;
      } catch (error) {}
    },
    async copyVenue(venue) {
      const payload = venue;

      const filterVenues = this.venues.filter((v) =>
        v.name.includes(venue.name)
      );

      if (filterVenues.length) {
        let maxNumber = 0;

        filterVenues.forEach((obj) => {
          const slug = obj.slug;
          const parts = slug.split("-");
          const lastPart = parts[parts.length - 1];
          let number;

          if (parts.length > 1) {
            number = parseInt(lastPart);
          } else {
            number = parseInt(slug.split("-")[1]);
          }

          if (!isNaN(number) && number > maxNumber) {
            maxNumber = number;
          }
        });

        const newSlug = venue.name.toLowerCase().replace(/\s+/g, "");
        payload.slug = `${newSlug}-${maxNumber + 1}`;
      } else {
        payload.slug = venue.name.toLowerCase().replace(/\s+/g, "");
      }

      let json;

      try {
        const { data } = await this.getVenue(payload.id);
        json = data.venue ? data.venue.datajson : null;
      } catch (error) {}

      try {
        await this.createVenue({ ...payload, datajson: json });
        // await this.getVenues();
      } catch (error) {}
    },

    async editVenue(venue) {
      this.$router.push(`/edit-venue-builder/${venue.id}`).catch(() => {});
    },
  },
  async created() {
    await this.getVenues();
    const editImage = new Image();
    editImage.src = "/img/invalid.svg";
    let invalidImage;

    editImage.onload = () => {
      invalidImage = editImage;
      this.$store.commit("SET_INVALID_IMAGE", invalidImage);
    };
  },
  computed: {
    ...mapGetters(["venue", "venues"]),
  },
};
</script>

<style lang="scss">
.workspace {
  width: 100%;
  height: 800px;
}

.edit_section_modal {
  .modal {
    height: unset;

    .modal-content {
      margin: 0;
    }
  }
}
</style>
