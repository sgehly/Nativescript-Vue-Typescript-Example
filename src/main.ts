const Vue = require('nativescript-vue');

//const HelloWorld = require('./components/HelloWorld.vue');
import HelloWorld from './components/HelloWorld.vue'

import './styles.scss';

// Uncommment the following to see NativeScript-Vue output logs
Vue.config.silent = false;

new Vue({

  render: h => {
  	return h(HelloWorld);
  },


}).$start();