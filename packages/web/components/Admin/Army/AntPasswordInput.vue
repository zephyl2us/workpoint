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
      :for="vid || name"
      class="col-form-label"
      :class="[labelClass, { 'has-error': errors[0] }]"
      @click="$refs[`input-${name}`].focus()"
    >
      <span>{{ $t(`validation.names.${name}_password`) }}</span>
    </label>
    <div :class="inputClass">
      <div class="d-flex">
        <div class="w-100">
          <div class="input-group">
            <input
              :id="vid || name"
              :ref="`input-${name}`"
              v-model="innerValue"
              class="form-control"
              :class="{ 'is-invalid': errors[0], 'has-value': hasValue }"
              :disabled="disabled"
              :type="type"
              :placeholder="placeholder"
              v-bind="ariaInput"
              @focus="onFocus"
              @blur="onBlur"
            >
            <div v-if="innerValue" class="input-group-append">
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
        <div class="d-flex">
          <button v-if="generate" type="button" class="btn btn-primary ml-2" @click="onClickRandom()">
            <i class="fa-light fa-shuffle"></i>
          </button>
        </div>
      </div>
    </div>
  </ValidationProvider>
</template>
<script>
export default {
  name: 'AntPasswordInput',
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
    // type: {
    //   type: String,
    //   default: "text",
    //   validator(value) {
    //     return [
    //       "text",
    //       "password",
    //     ].includes(value)
    //   }
    // },
    value: {
      type: null,
      default: ""
		},
		hint: {
			type: String,
			default: ''
		},
		labelClass: {
			type: String,
			default: 'col-sm-4 col-md-3'
		},
		inputClass: {
			type: String,
			default: 'col-sm-8 col-md-6'
		},
    generate: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    innerValue: "",
    type: "password"
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
  },
  methods: {
    onFocus () {
      this.type = "text"
    },
    onBlur () {
      this.type = "password"
    },
    onClickRandom () {
      const password = this.randomString(20, {
        symbol: true
      })

      this.innerValue = password
      this.type = "text"
    }
  }
}
</script>
