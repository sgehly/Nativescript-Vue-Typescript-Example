import Vue = require('nativescript-vue');

//const HelloWorld = require('./components/HelloWorld.vue');
import HelloWorld from './components/HelloWorld.vue'

import './styles.scss';

// Uncommment the following to see NativeScript-Vue output logs
Vue.config.silent = false;
new Vue({

  render: h => h('frame', [h(HelloWorld)]),

}).$start({ getRootView(vm) { return vm.$el.nativeView } })