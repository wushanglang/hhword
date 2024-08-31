<template>
  <div class="con">
    <div style="display: flex">
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
              <span class="iconfont">&#xe654;</span>
            </div>
          </div>

          <div v-if="cur.tran">
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
      </div>
      <component :is="currentList"></component>
    </div>

    <div class="total-footer">
      <div class="status">
        <label class="swap" data-tooltip="shift + tab" @click="wordIndex--">
          <span class="icon iconfont">←</span>
        </label>

        <label class="swap" data-tooltip="tab" @click="wordIndex++">
          <span class="icon iconfont">→</span>
        </label>

        <label class="swap" data-tooltip="收藏：ctrl + alt + L" @click="switchLike">
          <span :class="cur.likeTag ? 'iconfont positive' : 'iconfont'">&#xe68a;</span>
        </label>

        <label class="swap" data-tooltip="标熟：ctrl + alt + f" @click="switchComplete">
          <span :class="cur.completeTag ? 'iconfont positive' : 'iconfont '">&#xe64a;</span>
        </label>

        <label class="swap" data-tooltip="隐藏：ctl + h" @click="switchSeeTag()">
          <span v-if="seeTag" class="iconfont">&#xe6de;</span>
          <span v-else class="iconfont">&#xe61a;</span>
        </label>
      </div>
      <div class="nav" style="display: flex">
        <div
          :class="currentList === 'TodayList' ? 'active' : ''"
          @click="switchComponent('TodayList')"
        >
          Today
        </div>
        <div
          :class="currentList === 'TYesterdayList' ? 'active' : ''"
          @click="switchComponent('TYesterdayList')"
        >
          Yesterday
        </div>
        <div
          :class="currentList === 'TLearnList' ? 'active' : ''"
          @click="switchComponent('TLearnList')"
        >
          Learn
        </div>
        <div
          :class="currentList === 'TReviewList' ? 'active' : ''"
          @click="switchComponent('TReviewList')"
        >
          Review
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TLearnList from '../../components/list/TLearnList.vue'
import TReviewList from '../../components/list/TReviewList.vue'
import TodayList from '../../components/list/TodayList.vue'
import TYesterdayList from '../../components/list/TYesterdayList.vue'
export default {
  components: {
    TodayList,
    TReviewList,
    TLearnList,
    TYesterdayList
  }
}
</script>

<script setup>
import { playStatus, playClick, speech } from '../../util/sound'
import { cur, wordIndex, chars, charIndex, highlightWords } from '../../util/wordUtil'
import { dayTimeInterval, clearTimeInterval } from '../../util/common'
import { ref, onMounted, onUnmounted } from 'vue'

// 默写模式
let seeTag = ref(false || localStorage.getItem('seeTag') == 'true')
// 动态词表
let currentList = ref('TodayList')

function switchSeeTag() {
  seeTag.value = !seeTag.value
  localStorage.setItem('seeTag', seeTag.value)
}

function switchLike() {
  cur.value.likeTag = !cur.value.likeTag
  window.word.switchLike(cur.value.id)
}

function switchComplete() {
  cur.value.completeTag = !cur.value.completeTag
  window.word.switchComplete(cur.value.id)
  if (cur.value.completeTag) wordIndex.value++
}

// 键盘监听： 快捷键, eq, complete, fail
const handleKeyup = (event) => {
  if (event.ctrlKey) {
    // FAST KEY: like, complete, hide, speech
    if (event.altKey) {
      switch (event.key) {
        case 'l':
          switchLike()
          break
        case 'f':
          switchComplete()
          break
      }
    } else {
      switch (event.key) {
        case 'h':
          switchSeeTag()
          break
        case 's':
          speech(cur.value.word)
          break
      }
    }
    return
  } else if (charIndex.value === chars.value.length) {
    // Word Complete
    wordIndex.value++
    window.count.increTypeCount(cur.value.id)
    return
  }

  switch (event.key) {
    case chars.value[charIndex.value]:
      // EQ
      charIndex.value++
      playClick()
      break
    case 'Tab':
      // FAST KEY: Tab
      event.shiftKey ? wordIndex.value-- : wordIndex.value++
      charIndex.value = 0
      break
    default:
      // FAIL
      if (/^[a-zA-Z ]$/.test(event.key)) {
        charIndex.value = 0
        playStatus()
        speech(cur.value.word)
      }
      break
  }
}

// 避免空格下拉
document.addEventListener('keydown', function (event) {
  if (event.key === ' ') event.preventDefault()
})

// bug of virtual-scroll when update list instead of dymanic component
function switchComponent(listName) {
  if (listName === currentList.value) return
  currentList.value = listName
}

onMounted(() => {
  window.addEventListener('keyup', handleKeyup)
  dayTimeInterval()
})
onUnmounted(() => {
  clearTimeInterval()
  window.removeEventListener('keyup', handleKeyup)
})
</script>

<style scoped>
.con {
  display: flex;
  flex-direction: column;
}
.detail {
  min-width: 46%;
  max-width: 46%;
}
</style>

