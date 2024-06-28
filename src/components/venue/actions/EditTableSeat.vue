<template>
  <div class="form_fields">
    <div class="field_block half_field" v-if="editSeat.seat && editSeat.seat.length === 1">
      <label>
        <span class="field_name">Seat name</span>
        <input type="text" v-model="editData.seat" @input="updateSeat" maxlength="4"/>
      </label>
    </div>


    <div class="field_block selected_seats" v-if="getSeats && getSeats.length > 1">
      <div>Selected Seats</div>
      <ul>
        <li v-for="(seat, index) in getSeats" :key="index">{{ `${seat.attrs.number}${getSeats[index + 1]?', ':''} ` }}</li>
      </ul>
    </div>

    <span class="divider"></span>

    <div class="field_block">
      <div class="check_group">
        <label>
          <input type="checkbox" name="invalid_seat" value="19" v-model="editData.invalid" @change="updateSeat"/>
          <span class="custom_check icon_invalid">Accessible</span>
        </label>
      </div>
    </div>

    <span class="divider"></span>

    <div class="form_btns">
      <!-- <button class="secondary_btn" @click="cleatSeatType">Clear seat type</button> -->
      <button class="secondary_btn" @click="deleteSeat">Delete seat</button>
      <button class="primary_btn" @click="saveUpdate">Save seat</button>
    </div>
  </div>
</template>

<script>
import {

  editTableSeat,
  deleteTableSeat,
} from "@/helpers/table/generator";
import {
  deselectSeats
} from '@/helpers/seatUtils';
export default {
  props: {
    editSeat: {
      type: Object,
      default: () => { },
    },
  },
  watch: {
    editSeat() {
      if (this.editSeat.seat) {
        if (this.editSeat.seat.length === 1) {
          this.editData.seat = this.editSeat.seat[0].number;
          this.editData.invalid = this.editSeat.seat[0].invalid;
        } else if (!this.editSeat.seat.length) {
          this.$emit("closeModal");
        }
      }
    },
  },
  data() {
    return {
      editData: {
        seat: null,
        invalid: false
      },
    };
  },
  created() {
    if (this.editSeat.seat) {
      if (this.editSeat.seat.length === 1) {
        this.editData.seat = this.editSeat.seat[0].number;
        this.editData.invalid = this.editSeat.seat[0].invalid;
      } else if (!this.editSeat.seat.length) {
        this.$emit("closeModal");
      }
    }

  },
  methods: {
    cleatSeatType() {
      this.editData.invalid = false;
      this.updateSeat();
    },
    saveUpdate() {
      deselectSeats();
      this.$emit("closeModal");
    },
    updateSeat() {
      const payload = {
        seatData: this.editSeat,
        newData: this.editData,
      };
      editTableSeat(payload);
      this.editSeat.seat[0].number = this.editData.seat;
      this.editSeat.seat[0].invalid = this.editData.invalid;
    },
    deleteSeat() {
      const payload = {
        seatData: this.editSeat,
        newData: this.editData,
      };

      deleteTableSeat(payload);

      // this.$emit("closeModal");
    },
  },
  computed: {
    getSeats() {
      return this.editSeat.seat
    }
  }
};
</script>

<style></style>
