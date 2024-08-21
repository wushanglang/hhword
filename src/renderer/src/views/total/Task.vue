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
          :class="currentList === 'TaskList' ? 'active' : ''"
          @click="switchComponent('TaskList')"
        >
          待学
        </div>
        <div
          :class="currentList === 'TotalList' ? 'active' : ''"
          @click="switchComponent('TotalList')"
        >
          全部
        </div>
        <div
          :class="currentList === 'LikeList' ? 'active' : ''"
          @click="switchComponent('LikeList')"
        >
          收藏
        </div>
        <div
          :class="currentList === 'CompleteList' ? 'active' : ''"
          @click="switchComponent('CompleteList')"
        >
          完成
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TaskList from '../../components/list/TaskList.vue'
import CompleteList from '../../components/list/CompleteList.vue'
import LikeList from '../../components/list/LikeList.vue'
import TotalList from '../../components/list/TotalList.vue'
export default {
  components: {
    TaskList,
    TotalList,
    CompleteList,
    LikeList
  }
}
</script>

<script setup>
import { playStatus, playClick, speech } from '../../util/sound'
import { cur, wordIndex, chars, charIndex, highlightWords, wordList } from '../../util/wordUtil'
import { dayTimeInterval, clearTimeInterval } from '../../util/common'
import { ref, onMounted, onUnmounted } from 'vue'

// 默写模式
let seeTag = ref(false || localStorage.getItem('seeTag') == 'true')
// 动态词表
let currentList = ref('TaskList')

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

// 避免空格下拉
document.addEventListener('keydown', function (event) {
  if (event.key === ' ') event.preventDefault()
})

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
    localStorage.setItem('typeIds', (localStorage.getItem('typeIds') || '-1') + ',' + cur.value.id)
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

function switchComponent(listName) {
  if (listName === currentList.value) return
  storeIndex()
  currentList.value = listName
}

function check(i) {
  if (currentList.value === 'TotalList') return false
  if (currentList.value === 'TaskList') return wordList.value[i].completeTag
  if (currentList.value === 'CompleteList') return !wordList.value[i].completeTag
  return !wordList.value[i].likeTag
}
function storeIndex() {
  if (wordList.value.length === 0) return
  let cnt = 0
  for (let i = wordIndex.value; i >= 0; i--) if (check(i)) cnt++

  let finalIndex = wordIndex.value - cnt < 0 ? 0 : wordIndex.value - cnt
  localStorage.setItem(currentList.value, finalIndex)
}
onMounted(() => {
  window.addEventListener('keyup', handleKeyup)
  dayTimeInterval()
})
onUnmounted(() => {
  clearTimeInterval()
  window.removeEventListener('keyup', handleKeyup)
  storeIndex()
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

