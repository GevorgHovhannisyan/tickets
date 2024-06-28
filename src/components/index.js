import Vue from "vue";

import CreateVenueForm from "./venue/CreateVenueForm.vue";
import AddElementToVenue from "./venue/AddElementToVenue.vue";
import AddSectionForm from "./venue/element-forms/AddSectionForm.vue";
import AddAdmissionForm from "./venue/element-forms/AddAdmissionForm.vue";
import AddTableForm from "./venue/element-forms/AddTableForm.vue";
import EditSection from "./venue/actions/EditSection.vue";
import EditSeat from "./venue/actions/EditSeat.vue";
import EditTable from "./venue/actions/EditTable.vue";
import EditTableSeat from "./venue/actions/EditTableSeat.vue";

import EditArea from "./venue/actions/EditArea.vue";

import EditScene from "./venue/actions/EditScene.vue";
import EditText from "./venue/actions/EditText.vue";

import AddTextForm from "./venue/element-forms/AddTextForm.vue";

// MODALS
import Modal from "./common/Modal.vue";
import Loader from "./common/Loader.vue";


Vue.component("Modal", Modal);
Vue.component("CreateVenueForm", CreateVenueForm);
Vue.component("AddElementToVenue", AddElementToVenue);
Vue.component("AddSectionForm", AddSectionForm);
Vue.component("AddAdmissionForm", AddAdmissionForm);
Vue.component("AddTableForm", AddTableForm);
Vue.component("EditSection", EditSection);
Vue.component("EditSeat", EditSeat);
Vue.component("EditTable", EditTable);
Vue.component("EditTableSeat", EditTableSeat);
Vue.component("EditArea", EditArea);
Vue.component("EditScene", EditScene);
Vue.component("EditText", EditText);

Vue.component("AddTextForm", AddTextForm);

Vue.component("Loader", Loader);