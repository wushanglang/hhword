<template>
  <div>
    <div>
      <div class="wordList" style="padding-top: 4rem">
        <div v-for="(word, index) in wordList" :key="word.id">
          <div class="word" @click="updateWord(index)" :data-tooltip="tip(word)">
            <div :class="wordList[index].completeTag ? 'complete' : ''" style="font-size: 20px">
              {{ word.word }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <dialog id="dialog" onclick="dialog.close()">
      <article v-if="cur" @click="$event.stopPropagation()">
        <div class="name" style="display: flex">
          <span>{{ cur.word }}</span>
          <div class="status">
            <div class="swap iconfont" @click="switchLike">
              <span :class="cur.likeTag ? 'positive' : ''">&#xe68a;</span>
            </div>
            <div class="swap iconfont" @click="switchComplete">
              <span :class="cur.completeTag ? 'positive' : ''">&#xe64a;</span>
            </div>
          </div>
        </div>
        <div class="info">
          <div @click="speech(cur.word)" v-if="cur.voice">
            <div style="cursor: pointer">
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
                <div>{{ sentence.en }}</div>
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
      </article>
    </dialog>

    <div class="option" style="display: flex; justify-content: space-around; margin-top: 4rem">
      <button class="btn secondary" @click="router.push('/')">Back</button>
      <button class="btn" @click="router.push(path)">Next</button>
    </div>
  </div>
</template>

<script setup>
import { speech } from '../../util/sound'
import { storeCnt } from '../../util/common'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const path = route.query.path
let wordList = ref(null)
let cur = ref(null)

onMounted(() => {
  initData()
})

// 提交复习列表，更新单词复习时间与周期
function submit() {
  let tmpList = wordList.value.filter((item) => item.completeTag === 0)
  if (path === 'learn') {
    storeCnt('Learn', wordList.value.length)
    for (let i = 0; i < tmpList.length; i++) window.word.saveReviewTime(tmpList[i].id)
  } else {
    storeCnt('Review', wordList.value.length)
    let keepList = JSON.parse(route.query.keepList)
 
    for (let i = 0; i < tmpList.length; i++) {
      if (!keepList.includes(tmpList[i].id)) { 
        tmpList[i].reviewCycle === 6
          ? window.word.switchComplete(tmpList[i].id)
          : window.word.increReviewCycle(tmpList[i].id, tmpList[i].reviewCycle)
      } else { 
        window.word.increReviewCycle(tmpList[i].id, tmpList[i].reviewCycle - 1)
      }
    }
  }
}

const router = useRouter()

function initData() {
  let ids = route.query.ids
  window.word.listByIds(ids).then((data) => {
    wordList.value = data
    submit()
    cur.value = wordList.value[0]
    for (let i = 0; i < data.length; i++) {
      let tmp = JSON.parse(data[i].content)
      data[i].voice = tmp.voice
      data[i].tran = tmp.tran
      data[i].phrase = tmp.phrase
      data[i].sentence = tmp.sentence
    }
  })
}
function tip(word) {
  return word.tran[0].pos + '. ' + word.tran[0].cn
}

function updateWord(index) {
  if (index >= wordList.value.length || index < 0) return // 越界
  cur.value = wordList.value[index]
  speech(cur.value.word)
  dialog.showModal()
}

function switchComplete() {
  cur.value.completeTag = !cur.value.completeTag
  window.word.switchComplete(cur.value.id)
}
function switchLike() {
  cur.value.likeTag = !cur.value.likeTag
  window.word.switchLike(cur.value.id)
}
</script>

<style scoped>
.name {
  font-size: 35px;
}
.wordList {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  justify-items: center;
  row-gap: 1.6rem;
}
.word {
  min-width: 320px;
  max-width: 320px;
  text-align: center;
  cursor: pointer;
  padding: 10px 0 10px 0;
  transition: 200ms;
}
.word:hover {
  box-shadow: 0 0 0 1px inset;
  border-radius: 4px;
}

.btn {
  padding: 6px 16px;
}
</style>