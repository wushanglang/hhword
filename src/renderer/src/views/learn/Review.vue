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
          <span :class="cur.likeTag ? 'iconfont positive' : 'iconfont '">&#xe68a;</span>
        </label>

        <label class="swap" data-tooltip="标熟：ctrl + alt + f" @click="switchCompleteEvent()">
          <span :class="cur.completeTag ? 'iconfont positive' : 'iconfont '">&#xe64a;</span>
        </label>

        <label class="swap" data-tooltip="keep：ctrl + k" @click="increCycle()">
          <span :class="cur.keepTag ? 'iconfont positive' : 'iconfont '"><strong>K</strong></span>
        </label>
        <label class="swap" data-tooltip="help">
          <span class="iconfont" onclick="modal.showModal()"><strong>?</strong></span>
        </label>
      </div>
    </div>

    <dialog id="modal" class="modal" onclick="modal.close()">
      <article
        @click="$event.stopPropagation()"
        style="width: 35%; padding: 1.8em; border-radius: 1em"
      >
        <ul>
          <li>
            <strong>艾宾浩斯记忆周期：</strong>
            <ul>
              <li class="py-2">第一个复习周期：12小时</li>
              <li class="py-2">第二个复习周期：1天</li>
              <li class="py-2">第三个复习周期：2天</li>
              <li class="py-2">第四个复习周期：4天</li>
              <li class="py-2">第五个复习周期：7天</li>
              <li class="py-2">第六个复习周期：15天</li>
            </ul>
          </li>
          <li><strong>keep：保持当前单词的复习周期</strong></li>
        </ul>
      </article>
    </dialog>

    <LearnList nameIndex="reviewIndex"></LearnList>
  </div>
</template>

<script setup>
import LearnList from '../../components/list/LearnList.vue'
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
import { ref, onMounted, onUnmounted } from 'vue'

let seeTag = ref(false)

function switchCompleteEvent() {
  switchComplete(cur.value)
  if (cur.value.completeTag) {
    seeTag.value = false
    wordIndex.value++
  }
}

function increCycle() {
  cur.value.keepTag = !cur.value.keepTag
}

const handleCtrlKey = (key) => {
  if (event.altKey)
    switch (event.key) {
      case 'l':
        switchLike(cur.value)
        break
      case 'f':
        switchCompleteEvent()
        break
    }
  else
    switch (key) {
      case 'k':
        increCycle()
        break
      case 's':
        speech(cur.value.word)
    }
}
let typeIds = localStorage.getItem('typeIds') || '-1,'
const handleComplete = () => {
  playClick()
  window.count.increTypeCount()
  if (seeTag.value) {
    localStorage.setItem('typeIds', typeIds + ',' + cur.value.id)
    wordIndex.value++
  }
  seeTag.value = !seeTag.value
  speech(cur.value.word)
  charIndex.value = 0
}

const handleKeyup = (event) => {
  if (event.ctrlKey) {
    // FAST KEY
    handleCtrlKey(event.key)
    return
  }
  if (charIndex.value === chars.value.length) {
    // COMPLETE
    handleComplete()
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
li {
  margin-top: 8px;
}
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
