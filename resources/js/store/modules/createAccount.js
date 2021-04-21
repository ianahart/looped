import axios from 'axios';

const initialState = () => {

  return {

    form: [
          {field: 'firstName', errors: [], label: 'First Name', value: '',size: 'md', type: 'text'},
          {field: 'lastName', errors: [], label: 'Last Name', value: '', size: 'md', type: 'text'},
          {field: 'email', errors: [], label: 'Email', value: '', size: 'lg', type: 'text'},
          {field: 'password', errors: [], label: 'Create Password', value: '', size: 'lg', type: 'password'},
          {field: 'password_confirmation', errors: [], label: 'Confirm Password', value: '', size: 'lg', type: 'password'},
    ],
    hasErrors: false,
    isSubmitted: false,
    isChecked: false,
    checkboxError: '',
    isPasswordShowing: false,
    emailExistsError: '',
  }
}

const createAccount = {

  namespaced: true,



  state: initialState(),

  getters: {

    mediumFields: (state) => {

      return state
      .form
      .filter(
        (field) => {

        return field.size === 'md';
        }
      );
    },

    largeFields: (state) => {

      return state
      .form
      .filter(
        (field) => {

        return field.size === 'lg';
        }
      );
    },

    formData: (state) => {

      const formValues = state.form
        .map(
          (field) => {

          return { [field.field]: field.value };
        }
      );

      return Object.assign({}, ...formValues);
    },

    getFieldNames: (state) => {

      return state.form
      .map(
          (field) => {

          return field.field;
        }
     );
    },
  },

  mutations: {

    CHECKBOX_ERROR: (state, payload) => {

      state.checkboxError = payload;
    },

    TOGGLE_CHECKBOX: (state) => {

      state.isChecked = !state.isChecked;
    },

    RESET_ERRORS: (state) => {

      state.hasErrors =  false;

      state.checkboxError = '';

      state.form
      .forEach(
          (field) => {

          field.errors = [];
        }
      );
    },

    SET_VALIDATION_ERRORS: (state, payload) => {

      const newErrorFields = [];

      for (let obj in payload.errors) {

       const fieldName = obj.split('.')[1];

       const newErrorField = {[fieldName]:  payload.errors[obj]};

        newErrorFields.push(newErrorField);
      }

      newErrorFields.forEach((newErrorField, index) => {

        const errorKey = Object.keys(newErrorField)[0];

        state.form.forEach((oldField) => {

            if (errorKey === oldField.field) {

              oldField.errors.push(...newErrorFields[index][errorKey])
            }
        })
      });
    },

    UPDATE_FIELD: (state, payload) => {

      state
      .form
      .find(
        (oldField) => {

          if (oldField.field === payload.field) {

              oldField.value = payload.newValue;

              oldField.errors.push( payload.error);

              state.hasErrors = oldField.errors.length ? true : false;
          }
        }
      );
    },

    TOGGLE_PASSWORD_VISIBILITY: (state) => {

      state.isPasswordShowing = !state.isPasswordShowing;

      state.form
      .forEach(
          (oldField) => {

            const createPasswordShowing = oldField.field === 'password' && state.isPasswordShowing;

            const confirmPasswordShowing =  oldField.field === 'password_confirmation' && state.isPasswordShowing;

            if (
                 oldField.field.includes('password') ||
                 oldField.field.includes('password_confirmation')
            ) {
                 oldField.type = createPasswordShowing || confirmPasswordShowing ? 'text' : 'password';
              }
          }
       );
    },

    SET_EMAIL_EXISTS_ERROR: (state, payload) => {

      state.form
      .forEach(
        (oldField) => {

        if (oldField.field === 'email') {

          oldField.errors.push(payload);
        }
      });
    },

    SUBMIT_FORM: (state, payload) => {

      state.isSubmitted = payload;
    },

    RESET_MODULE: (state) => {

      Object.assign(state, initialState());
    },
  },

  actions: {

     async SUBMIT_FORM ({getters, state, commit }) {

      let response;

        try {

          const formData = getters.formData;

          response = await axios(
            {
              method: 'POST',
              url: '/api/register',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              data: {

                formData,
              }
          }
          );

          if (response.status === 201) {

            commit('SUBMIT_FORM', response.data.isSubmitted);
          }

        } catch(e) {

            const { errors } = e.response.data;

            if (e.response.status === 422) {

              commit('SET_VALIDATION_ERRORS',
                {
                  errors,
                  fields: getters.getFieldNames
                }
              );
            }

            if (e.response.status === 409) {

              commit('SET_EMAIL_EXISTS_ERROR', errors);
            }

        }
    }
  }
};


export default createAccount;


