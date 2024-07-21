<template>
  <article>
    <div>
      <div class="title">今日学习</div>
      <div class="count">{{ todayLearn }} <span>词</span></div>
    </div>
    <div>
      <div class="title">今日复习</div>
      <div class="count">{{ todayReview }} <span>词</span></div>
    </div>
    <div>
      <div class="title">今日时长</div>
      <div class="count">{{ todayTime }} <span>分</span></div>
    </div>
    <div>
      <div class="title">总学习</div>
      <div class="count">{{ totalLearn }} <span>词</span></div>
    </div>
    <div>
      <div class="title">总复习</div>
      <div class="count">{{ totalReview }} <span>词</span></div>
    </div>
    <div>
      <div class="title">总时长</div>
      <div class="count">{{ totalTime }} <span>分</span></div>
    </div>
  </article>
</template>

<script setup>
import { ref } from 'vue'
let todayTime = ref(parseInt(localStorage.getItem('todayTime') || 0))
let totalTime = ref(parseInt(localStorage.getItem('totalTime') || 0))

let todayLearn = ref(parseInt(localStorage.getItem('todayLearn') || 0))
let totalLearn = ref(parseInt(localStorage.getItem('totalLearn') || 0))

let todayReview = ref(parseInt(localStorage.getItem('todayReview') || 0))
let totalReview = ref(parseInt(localStorage.getItem('totalReview') || 0))
</script>

<style scoped>
article {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}
article > div {
  width: 8rem;
}
.title,
span {
  font-size: 0.8rem;
  color: var(--pico-h6-color);
}
.count {
  font-size: 1.6rem;
  font-weight: bold;
}
</style>