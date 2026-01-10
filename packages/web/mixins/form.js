'use strict'

export default {
  data () {
    return {
      status: null
    }
  },
  computed: {
    /**
     * Check form status
     */
    isSubmitted () {
      return this._.eq(this.status, 'submitted')
    },
    /**
     * Add class disabled on submitted
     */
    addClassDisabledOnSubmitted () {
      return this.isSubmitted ? 'disabled' : ''
    }
  },
  methods: {
    /**
     * Set form status to submitted
     */
    submitting () {
      this.status = 'submitted'
    },
    /**
     * Handle form server errors
     */
    handleFormError (errors, formRef) {
			// console.log('FORM-ERROR', errors)
      if (this._.isArray(errors.data)) {
        const responseErrors = {}
        for (const err in errors.data) {
          const error = errors.data[err]
          // console.log(error)
          const errorMessage = this.$t(`validation.messages.${error.validation}`, {
            _field_: this.$t(`validation.names.${error.field}`),
            length: error.length
          })
          responseErrors[error.field] || (responseErrors[error.field] = []).push(errorMessage)
				}

				// console.log(responseErrors)

				if (!this._.has(formRef, 'setErrors')) {
					console.log('Cannot read form validation method')
					return
				}

				// console.log(formRef)

        formRef.setErrors(responseErrors)
      }
		},
		/**
     * Handle confirm
     */
    handleConfirm (callback, props) {
      const options = {
        okText: this.$t('messages.continue'),
        cancelText: this.$t('messages.close'),
        animation: 'fade'
      }
      this.$dialog
        .confirm(this.$t('messages.are_you_sure'), options)
        .then((dialog) => {
          dialog.close && dialog.close()
          if (this._.isFunction(callback)) {
            callback(props)
          }
        })
        .catch(function() {
          // Click cancel
        })
    },
    resetFormError (formRef) {
      formRef.reset()
    }
  },
  watch: {
    /**
     * Handle form error server
     */
    'responseError': {
      handler (error) {
				if (this._.isEmpty(error)) {
					return
				}

        if (error.status === 400) {
          if (this._.has(error, 'data.code')) {
						const args = this._.get(error, 'data.args', {})
            // Handle general error
            const tr = this.$t(`response.error.${error.data.code}`, args)
            this.$toast.global.cerror(tr)
          } else {
						// Handle form error
						const formRef = this._.has(error, 'formRef') ? error.formRef : this.formRef
            this.handleFormError(error, this.$refs[formRef])
          }
        }
				this.status = null
				if (this._.isFunction(this.hookResponseError)) {
					this.hookResponseError(error)
				}
      },
      deep: true
    },
    /**
     * Handle message on success
     */
    'responseSuccess': {
      handler (response) {
				if (this._.isEmpty(response)) {
					return
        }

        // console.log('xxxx', response)

        if (response.status === 'success') {
					const tr = this._.has(response, 'code') ? `response.success.${response.code}` : 'response.success.saved'
          const message = this.$t(tr)
          this.$toast.global.csuccess(message)
				}
				if (this._.isFunction(this.hookResponseSuccess)) {
					this.hookResponseSuccess(response)
        }
        // this.status = null
				setTimeout(() => {
          this.status = null
          // console.log('status')
					if (this._.isFunction(this.hookResponseDone)) {
						this.hookResponseDone(response)
					}
				}, 1000)
      },
      deep: true
    }
  }

}
