import { createRouter, createWebHashHistory } from 'vue-router';
import DictList from '../views/home/DictList.vue';
import Home from '../views/home/Home.vue'; 
import Task from '../views/total/Task.vue'
import Finish from '../views/learn/Finish.vue'
import Learn from '../views/learn/Learn.vue'
import Review from '../views/learn/Review.vue'
import Today from '../views/total/Today.vue';
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/dictList',
    name: 'dictList',
    component: DictList
  },
  {
    path: '/task',
    name: 'task',
    component: Task
  },
  {
    path: '/learn',
    name: 'learn',
    component: Learn
  },
  {
    path: '/review',
    name: 'review',
    component: Review
  },
  {
    path: '/finish',
    name: 'Finish',
    component: Finish
  },
  {
    path: '/today',
    name: Today,
    component: Today
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
