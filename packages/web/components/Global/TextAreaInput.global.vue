<template>
  <ValidationProvider
    v-slot="{ errors, ariaInput, ariaMsg }"
    class="form-group row"
    tag="div"
    :vid="vid"
    :rules="rules"
    :name="name || label"
  >
    <label
      :for="name"
      class="col-md-3 col-form-label"
      :class="{ 'has-error': errors[0] }"
      @click="$refs[`input-${name}`].focus()"
    >
      <span>{{ $t(`validation.names.${name}`) }}</span>
    </label>
    <div class="col-md-9">
      <textarea
        :id="name"
        :ref="`input-${name}`"
        v-model="innerValue"
        class="form-control"
        :class="{ 'is-invalid': errors[0], 'has-value': hasValue }"
        :placeholder="placeholder"
        v-bind="ariaInput"
      ></textarea>
      <div
        v-if="errors[0]"
        class="invalid-feedback"
        v-bind="ariaMsg"
      >{{ errors[0] }}
      </div>
    </div>
  </ValidationProvider>
</template>
<script>
export default {
  name: 'TextAreaInput',
  props: {
    vid: {
      type: String,
      default: undefined
    },
    name: {
      type: String,
      default: ""
    },
    label: {
      type: String,
      default: ""
    },
    rules: {
      type: [Object, String],
      default: ""
    },
    placeholder: {
      type: String,
      default: ""
    },
    value: {
      type: null,
      default: ""
    }
  },
  data: () => ({
    innerValue: ""
  }),
  computed: {
    hasValue() {
      return !!this.innerValue;
    }
  },
  watch: {
    'innerValue': {
			handler (val) {
				this.$emit('input', val)
			}
    },
		'value': {
			handler (val) {
				if (val !== this.innerValue) {
        	this.innerValue = val
      	}
			}
		}
  },
  created() {
    if (this.value) {
      this.innerValue = this.value
    }
  }
}
</script>
