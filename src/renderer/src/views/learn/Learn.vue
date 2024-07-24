<template>
  <div class="con">
    <div class="detail">
      <div class="name">
        <span
          v-for="(char, index) in chars"
          :key="index"
          style="font-family: 'Consolas', monospace"
          :class="index < charIndex ? 'positive' : ''"
        >
          {{ seeTag && index >= charIndex ? '-' : char }}
        </span>
      </div>

      <div class="info" v-if="cur">
        <div @click="speech(cur.word)" v-if="cur.voice">
          <div data-tooltip="发音：ctrl + s" style="cursor: pointer">
            /{{ cur.voice }}/
            <span class="iconfont">&#xe654; </span>
          </div>
        </div>

        <div>
          <div v-for="(tran, index) in cur.tran" :key="index">
            <p>{{ tran.pos }}. {{ tran.cn }}</p>
          </div>
        </div>

        <div v-if="cur.sentence && cur.sentence.length">
          <ul v-for="(sentence, index) in cur.sentence" :key="index">
            <li>
              <div v-html="highlightWords(sentence.en, cur.word)"></div>
              <div>{{ sentence.cn }}</div>
            </li>
          </ul>
        </div>

        <div v-if="cur.phrase && cur.phrase.length">
          <ul v-for="(phrase, index) in cur.phrase" :key="index">
            <li>{{ phrase.en }} &emsp;{{ phrase.cn }}</li>
          </ul>
        </div>
      </div>

      <div class="status" v-if="cur">
        <label class="swap" data-tooltip="收藏：ctrl + alt + L" @click="switchLike(cur)">
          <span :class="cur.likeTag ? 'iconfont positive' : 'iconfont'">&#xe68a;</span>
        </label>

        <label class="swap" data-tooltip="标熟：ctrl + alt + f" @click="switchCompleteEvent()">
          <span :class="cur.completeTag ? 'iconfont positive' : 'iconfont '">&#xe64a;</span>
        </label>
      </div>
    </div>

    <LearnList nameIndex="learnIndex"></LearnList>
  </div>
</template>

<script setup>
import { playStatus, playClick, speech } from '../../util/sound'
import {
  switchComplete,
  switchLike,
  highlightWords,
  cur,
  wordIndex,
  chars,
  charIndex
} from '../../util/wordUtil'
import { dayTimeInterval, clearTimeInterval } from '../../util/common'
import LearnList from '../../components/list/LearnList.vue'
import { ref, onMounted, onUnmounted } from 'vue'

// 默写模式
let seeTag = ref(false)

function switchCompleteEvent() {
  switchComplete(cur.value)
  if (cur.value.completeTag) {
    seeTag.value = false
    wordIndex.value++
  }
}

const handleCtrlKey = (event) => {
  if (event.altKey) {
    switch (event.key) {
      case 'l':
        switchLike(cur.value)
        break
      case 'f':
        switchCompleteEvent()
        break
    }
  } else if (event.key === 's') speech(cur.value.word)
}

const handleComlete = () => {
  playClick()
  window.count.increTypeCount()
  if (seeTag.value) {
    localStorage.setItem('typeIds', (localStorage.getItem('typeIds') || '-1') + ',' + cur.value.id)
    wordIndex.value++
  }
  seeTag.value = !seeTag.value
  charIndex.value = 0
  speech(cur.value.word)
}
const handleKeyup = (event) => {
  if (event.ctrlKey) {
    // FAST KEY
    handleCtrlKey(event)
    return
  }
  if (charIndex.value === chars.value.length) {
    // COMPLETE
    handleComlete()
    return
  }
  if (chars.value[charIndex.value] === event.key) {
    // EQ
    charIndex.value++
    playClick()
  } else if (/^[a-zA-Z ]$/.test(event.key)) {
    // FAIL
    charIndex.value = 0
    playStatus()
    speech(cur.value.word)
  }
}

onMounted(() => {
  dayTimeInterval()
  window.addEventListener('keyup', handleKeyup)
})

onUnmounted(() => {
  clearTimeInterval()
  window.removeEventListener('keyup', handleKeyup)
})
</script>


<style scoped>
.con {
  display: flex;
  height: 96vh;
}
.detail {
  min-width: 46%;
  max-width: 46%;
  display: flex;
  flex-direction: column;
}
</style>
