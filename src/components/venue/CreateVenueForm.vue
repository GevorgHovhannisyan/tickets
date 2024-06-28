<template>
	<ValidationObserver
		ref="create_venue"
		slim
		v-slot="{ handleSubmit, reset }"
	>
		<form
			class="create_venue"
			@submit.prevent="handleSubmit(submitVenue)"
			@reset.prevent="reset"
			autocomplete="off"
		>
			<div class="modal_title">Create New Venue</div>

			<div class="field_block">
				<ValidationProvider
					name="name"
					v-slot="{ errors }"
					slim
					rules="required"
				>
					<label :class="{ has_error: errors[0] }">
						<span class="field_name">Venue Name</span>
						<input type="text" name="name" v-model="venue.name" />
						<span class="error_message">{{ errors[0] ? "Required field" : "" }}</span>
					</label>
				</ValidationProvider>
			</div>
			<button class="primary_btn" type="submit">NEXT</button>
		</form>
	</ValidationObserver>
</template>

<script>
export default {
	data() {
		return {
			venue: {
				name: null,
				attendees: 500,
			},
		};
	},
	methods: {
		submitVenue() {
			this.$emit("submitVenue", this.venue);
		},
	},
};
</script>

<style></style>
