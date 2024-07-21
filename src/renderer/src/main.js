import { createApp } from 'vue'
import App from './App.vue'
import './assets/iconfont/iconfont.css'

import router from './router' 
import RecycleScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'; // 引入 CSS 文件

createApp(App).use(RecycleScroller).use(router).mount('#app');
router.push("/"); 