import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import '../../static/css/default.css'

// if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.prototype.eventBus = new Vue()
Vue.prototype.$toast = function (msg) {
  console.log(msg)
}

/* eslint-disabodele no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
