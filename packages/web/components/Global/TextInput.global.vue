<template>
  <ValidationProvider
    v-slot="{ errors, ariaInput, ariaMsg }"
    :class="groupClass"
    tag="div"
    :vid="vid"
    :rules="rules"
    :name="name || label"
  >
    <label
      :for="vid || name"
      :class="[labelClass, { 'has-error': errors[0] }]"
      @click="$refs[_.camelCase(`input-${name}`)].focus()"
    >
      <span>{{ $t(`validation.names.${name}`) }}</span>
    </label>
    <div :class="inputClass">
      <div class="input-group">
        <div v-if="prepenHtml" class="input-group-prepend">
          <span class="input-group-text" v-html="prepenHtml"></span>
        </div>
        <input
          :id="vid || _.camelCase(`input-${name}`)"
          :ref="_.camelCase(`input-${name}`)"
          v-model="innerValue"
          class="form-control"
          :class="{ 'is-invalid': errors[0], 'has-value': hasValue }"
          :disabled="disabled"
          :type="type"
          :placeholder="placeholder"
          v-bind="ariaInput"
        >
        <div v-if="clipboard" class="input-group-append">
          <button v-clipboard="innerValue" type="button" class="btn btn-light-secondary">
            <i class="fa-light fa-copy"></i>
          </button>
        </div>
      </div>
      <div
        v-if="errors[0]"
        class="invalid-feedback"
        v-bind="ariaMsg"
      >{{ errors[0] }}
      </div>
			<span v-else-if="textHelp" class="text-muted">
				<small>{{ textHelp }}</small>
			</span>
    </div>
  </ValidationProvider>
</template>
<script>
export default {
  name: 'TextInput',
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
		disabled: {
			type: Boolean,
			default: false
		},
    placeholder: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: "text",
      validator(value) {
        return [
          "url",
          "text",
          "password",
          "tel",
          "search",
          "number",
          "email"
        ].includes(value)
      }
    },
    value: {
      type: null,
      default: ""
		},
		hint: {
			type: String,
			default: ''
		},
    groupClass: {
      type: String,
      default: 'form-group row'
    },
		labelClass: {
			type: String,
			default: 'col-form-label col-sm-4 col-md-3'
		},
		inputClass: {
			type: String,
			default: 'col-sm-8 col-md-6'
		},
    prepenHtml: {
			type: String,
      default: null
    },
    clipboard: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    innerValue: ""
  }),
  computed: {
    hasValue() {
      return !!this.innerValue
		},
		textHelp () {
			const key = this.hint ? this.hint : this.name
			const exists = this.$te(`validation.hints.${key}`)
			return exists ? this.$t(`validation.hints.${key}`) : ''
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
