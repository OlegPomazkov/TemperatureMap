import Vue from 'vue'
import App from './App.vue'
import { Icon }  from 'leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'

axios.defaults.baseURL = 'http://api.openweathermap.org/data/2.5/weather';

// this part resolve an issue where the markers would not appear
delete Icon.Default.prototype._getIconUrl;

Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

Vue.config.productionTip = false
Vue.prototype.$axios = axios;

const app = {
  render: h => h(App)
};

new Vue(app).$mount("#app");
