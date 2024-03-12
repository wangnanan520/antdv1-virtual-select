import Vue from 'vue'
import App from './App.vue'
import 'ant-design-vue/dist/antd.css';
import avirtualselect from 'avirtualselect'

Vue.use(avirtualselect)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
