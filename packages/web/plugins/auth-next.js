'use strict'

import { LocalScheme } from "@nuxtjs/auth-next/dist/runtime"

console.log('test auth')

export default class AuthScheme extends LocalScheme {
  // fetchUser(endpoint) {
  //   console.log(endpoint)
  //   if (!this.check().valid) {
  //     return Promise.resolve();
  //   }
  //   if (!this.options.endpoints.user) {
  //     this.$auth.setUser({});
  //     return Promise.resolve();
  //   }
  //   return this.$auth.requestWith(this.name, endpoint, this.options.endpoints.user).then((response) => {
  //     const userData = getProp(response.data, this.options.user.property);
  //     if (!userData) {
  //       const error = new Error(`User Data response does not contain field ${this.options.user.property}`);
  //       return Promise.reject(error);
  //     }
  //     this.$auth.setUser(userData);
  //     return response;
  //   }).catch((error) => {
  //     this.$auth.callOnError(error, { method: "fetchUser" });
  //     return Promise.reject(error);
  //   });
  // }
}

// function getProp(holder, propName) {
//   if (!propName || !holder || typeof holder !== "object") {
//     return holder;
//   }
//   if (propName in holder) {
//     return holder[propName];
//   }
//   const propParts = Array.isArray(propName) ? propName : (propName + "").split(".");
//   let result = holder;
//   while (propParts.length && result) {
//     result = result[propParts.shift()];
//   }
//   return result;
// }
