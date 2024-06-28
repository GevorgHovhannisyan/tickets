<template>
  <div class="form_fields">
    <div class="field_block half_field" v-if="theSameRows">
      <label>
        <span class="field_name">Row Name</span>
        <input type="text" maxlength="2" v-model="editData.row" @input="updateSeat"/>
      </label>
    </div>

    <div class="field_block half_field" v-if="editSeat.seat.length === 1">
      <label>
        <span class="field_name">Seat name</span>
        <input type="text" maxlength="4" v-model="editData.seat" @input="updateSeat"/>
      </label>
    </div>

    <div
      class="field_block selected_seats"
      v-if="getSeats && getSeats.length > 1"
    >
      <div>Selected Seats</div>
      <ul>
        <li v-for="(seat, index) in getSeats" :key="index">
          {{
            `${seat.attrs.row}${seat.attrs.number}${
              getSeats[index + 1] ? ", " : ""
            }`
          }}
        </li>
      </ul>
    </div>

    <span class="divider"></span>

    <div class="field_block">
      <div class="check_group">
        <label>
          <input
            type="checkbox"
            name="invalid_seat"
            value="19"
            v-model="editData.invalid"
            @change="updateSeat"
          />
          <span class="custom_check icon_invalid">Accessible</span>
        </label>
      </div>
    </div>

    <span class="divider"></span>

    <div class="field_block">
      <span class="field_name">Shift Row(s)</span>
      <button
        type="button"
        class="shift_btn icon_left"
        @click="handleClick(-0.25)"
        @mousedown="startHold(-0.25)"
        @mouseup="stopHold"
        @mouseleave="stopHold"
      ></button>

      <button
        type="button"
        class="shift_btn icon_right"
        @click="handleClick(0.25)"
        @mousedown="startHold(0.25)"
        @mouseup="stopHold"
        @mouseleave="stopHold"
      ></button>
    </div>

    <span class="divider"></span>


    <div class="form_btns">
      <!-- <button class="secondary_btn" @click="cleatSeatType">
        Clear seat type
      </button> -->
      <button class="secondary_btn" @click="deleteSeat">Delete seat</button>
      <button class="primary_btn" @click="saveUpdate">Save seat</button>
    </div>
  </div>
</template>

<script>
import { deselectSeats, shiftRows } from "@/helpers/seatUtils";
import {
  deleteSectionSeat,
  editSectionSeat,
} from "../../../helpers/section/_generator";

export default {
  props: {
    editSeat: {
      type: Object,
      default: () => {},
    },
  },
  watch: {

    editSeat() {
      if (this.editSeat.seat && this.editSeat.seat.length === 1) {
        this.editData.row = this.editSeat.seat[0].row;
        this.editData.seat = this.editSeat.seat[0].number;
        this.editData.invalid = this.editSeat.seat[0].invalid;
      } else if (this.editSeat.seat && this.editSeat.seat.length > 1) {
        this.editData.row = this.editSeat.seat[0].row;
      } else if (!this.editSeat.seat.length) {
        this.$emit("closeModal");
      }
    },
  },
  data() {
    return {
      holdTimeout: null,
      holdInterval: null,
      isHolding: false,
      editData: {
        row: null,
        seat: null,
        invalid: false,
      },
    };
  },
  created() {
    window.addEventListener("keydown", this.handleKeyDown);

    if (this.editSeat.seat) {
      if (this.editSeat.seat.length === 1) {
        this.editData.row = this.editSeat.seat[0].row;
        this.editData.seat = this.editSeat.seat[0].number;
        this.editData.invalid = this.editSeat.seat[0].invalid;
      } else if (this.editSeat.seat && this.editSeat.seat.length > 1) {
        this.editData.row = this.editSeat.seat[0].row;
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
      const { layerId } = this.editSeat;
      deselectSeats(layerId, true);
      this.$emit("closeModal");
    },
    updateSeat() {
      const payload = {
        seatData: this.editSeat,
        newData: this.editData,
        rowId: this.editSeat.rowId,
      };

      editSectionSeat(payload);
      this.editSeat.seat[0].number = this.editData.seat;
      this.editSeat.seat[0].invalid = this.editData.invalid;
      // this.editSeat.seat[0].row = this.editData.row;
      
    },
    
    deleteSeat() {
      const payload = {
        seatData: this.editSeat,
        newData: this.editData,
        rowId: this.editSeat.rowId,
      };

      deleteSectionSeat(payload);

      this.$emit("closeModal");
    },
    handleKeyDown(event) {
      if (event.keyCode === 46) {
        this.deleteSeat();
      }
    },
    handleClick(amount) {
      if (!this.isHolding) {
        this.shiftRows(amount);
      }
    },

    shiftRows(amount) {
      const payload = {
        seatData: this.editSeat,
        newData: this.editData,
        rowId: this.editSeat.rowId,
      };
      shiftRows(amount, payload);
    },
    startHold(amount) {
      this.isHolding = false;
      this.holdTimeout = setTimeout(() => {
        this.isHolding = true;
        this.holdInterval = setInterval(() => {
          this.shiftRows(amount);
        }, 100); // Интервал вызова функции shiftRows при удерживании кнопки
      }, 100); // Время удерживания перед началом вызова функции
    },
    stopHold() {
      clearTimeout(this.holdTimeout);
      clearInterval(this.holdInterval);
      this.isHolding = false;
    }
  },
  computed: {
    theSameRows() {
      let ids = [];

      if (this.editSeat.seat && this.editSeat.seat.length) {
        ids = this.editSeat.seat.map((s) => s.attrs.rowId);
      }

      const id_array = [...new Set(ids)];

      return id_array.length === 1;
    },
    getSeats() {
      return this.editSeat.seat;
    },
  },
  destroyed() {
    window.removeEventListener("keydown", this.handleKeyDown);
  },
};
</script>

<style></style>
