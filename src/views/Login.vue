<template>
  
    <ValidationObserver ref="log_in" v-slot="{ handleSubmit }" slim>
      <form class="sign_form" @submit.prevent="handleSubmit(loginAdmin)">
        <h1 class="page_title">Welcome to Venue Builder</h1>
        <div class="form_fields">
          <ValidationProvider
            name="email"
            v-slot="{ errors }"
            rules="required|email"
            slim
          >
            <div class="field_block" :class="{ has_error: errors[0] }">
              <label>
                <span class="field_name">Email address</span>
                <input
                  v-model="login_data.email"
                  type="text"
                  name="email"
                />
                
              </label>
              <span class="error_message">{{ errors[0] }}</span>
            </div>
          </ValidationProvider>

          <ValidationProvider
            name="password"
            v-slot="{ errors }"
            rules="required"
            slim
          >
            <div class="field_block" :class="{ has_error: errors[0] }">
              <label>
                <span class="field_name">Password</span>
                <input
                  :type="type"
                  name="password"
                  v-model="login_data.password"
                  placeholder="Password"
                />
                
                <span
                  class="type_toggle"
                  @click="
                    type === 'password' ? (type = 'text') : (type = 'password')
                  "
                ></span>
              </label>
              <span class="error_message">{{ errors[0] }}</span>
            </div>
          </ValidationProvider>
          <div class="submit_btn">
            <button type="submit" class="primary_btn" aria-label="login">Log in</button>
          </div>
        </div>
      </form>
    </ValidationObserver>

 
  
</template>

<script>
import { mapActions } from "vuex";
export default {
  data() {
    return {
      login_data: {
        email: "testuser@example.com",
        password: "TestUser123",
      },
      type: "password",
    };
  },
  methods: {
    ...mapActions(["login"]),
    async loginAdmin() {
      const payload = {
        email: this.login_data.email,
        password: this.login_data.password,
      };

      await this.login(payload).catch((err) => {
        const error = err.response ? err.response.data.message : null;
        if (error) {
          const error_obj = {};

          if (error === "Wrong password") {
            error_obj.password = [error];
          } else {
            error_obj.email = [error];
          }
          this.$refs.log_in.setErrors(error_obj);
        }
      });
    },
  
  },
};
</script>
