import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import ElSearchTablePagination from 'el-table-pagination'
import 'element-ui/lib/theme-chalk/index.css';
import store from '@/store/index';
import './assets/custom.scss';
import './assets/water_icon.css';
import api from "@/utils/api"
import request from '@/utils/request'
import moment from 'moment'
import VDistpicker from 'v-distpicker'


Vue.use(ElementUI);
Vue.use(ElSearchTablePagination)
Vue.component('v-distpicker', VDistpicker)

Vue.prototype.api = api;
Vue.prototype.$request = request;
Vue.prototype.$websocket = store;
Vue.prototype.moment = moment;

Vue.config.productionTip = true



new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
