<template>
  <div class="con">
    <article class="dict">
      <div style="width: 100%">
        <div class="top">
          <div class="name">{{ dict.name }}</div>
          <div class="cnt">{{ countCompleteByDictId }} / {{ dict.wordCnt }}</div>
        </div>

        <progress class="progress" :value="countCompleteByDictId" :max="dict.wordCnt"></progress>

        <p class="intro">{{ dict.intro }}</p>

        <div class="button">
          <div role="button" class="outline contrast" @click="route('learn')">
            <strong>Learn</strong>
            <div style="text-align: center">{{ countLearnByDictId }}</div>
          </div>
          <div role="button" class="outline contrast" @click="route('review')">
            <strong>Review</strong>
            <div style="text-align: center">{{ countReview }}</div>
          </div>
          <div role="button" class="outline contrast" @click="route('task')">
            <strong>Total</strong>
          </div>
          <div role="button" class="outline contrast" @click="route('today')">
            <strong>Today</strong>
          </div>
        </div>
      </div>
    </article>

    <div class="count" style="display: flex; gap: 2rem; margin-top: 2em">
      <div :style="count ? 'font-weight: bold;' : ''" @click="count = true">热力图</div>
      <div :style="count ? '' : 'font-weight: bold;'" @click="count = false">统计</div>
    </div>

    <a v-if="adsUrl" :href="adsUrl" target="_blank" class="ads" style="">
      <img v-if="imgUrl" :src="imgUrl" />
    </a>

    <Count v-if="count"></Count>
    <Detail v-else></Detail>
  </div>
</template>

<script setup>
import Count from '../../components/count/Count.vue'
import Detail from '../../components/count/Detail.vue'
import { initTime } from '../../util/common'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
let dict = ref({})
let countCompleteByDictId = ref(0)
let countLearnByDictId = ref(0)
let countReview = ref(0)
let count = ref(true)

onMounted(() => {
  initTime()
  let dictId = localStorage.getItem('dictId')
  if (dictId === null) {
    dictId = 1
    localStorage.setItem('dictId', dictId)
  }
  window.dict.getDictById(dictId).then((data) => {
    dict.value = data
  })
  window.word.fetchCount(dictId).then((data) => {
    countCompleteByDictId.value = data.completeCount
    countLearnByDictId.value = data.learnCount
    countReview.value = data.reviewCount
  })
})

function route(path) {
  if (
    (path === 'review' && countReview.value === 0) ||
    (path === 'learn' && countLearnByDictId.value === 0)
  )
    return
  router.push(`/${path}`)
}
</script>

<style scoped>
.count > div {
  cursor: pointer;
}
.con {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}

.dict {
  border-radius: 0.4rem;
  display: flex;
  width: 30rem;
}

progress {
  height: 0.1rem;
}

.top {
  display: flex;
  justify-content: space-between;
}

.name {
  font-size: 1.4rem;
  font-weight: bold;
}
.cnt {
  margin-top: auto;
}
.intro {
  height: 4.5em;
  margin-bottom: 1em;
}
.button {
  display: flex;
  justify-content: space-between;
}
.button .outline {
  border: none;
  margin: 0;
  width: 6rem;
  padding: 8px 0;
  margin-bottom: 0.2rem;
  transition: box-shadow 150ms;
}
.outline:hover {
  box-shadow: 0 0 4px 1px;
}
.ads {
  position: absolute;
  width: 200px;
  height: 200px;
  right: 4px;
  top: 4rem;
  border-radius: 4px;
  overflow: hidden;
}
.ads > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
