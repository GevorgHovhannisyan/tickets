import Vue from "vue";
import * as VeeValidate from "vee-validate";
import { ValidationProvider, ValidationObserver } from "vee-validate";
import { extend } from "vee-validate";
import {
  required,
  email,
  min,
  confirmed,
  alpha_spaces,
} from "vee-validate/dist/rules";

// The types of validators used in the project
extend("required", required);
extend("confirmed", confirmed);
extend("email", email);
extend("min", min);
extend("alpha_spaces", alpha_spaces);

Vue.use(VeeValidate);
Vue.component("ValidationProvider", ValidationProvider);
Vue.component("ValidationObserver", ValidationObserver);
export default VeeValidate;
