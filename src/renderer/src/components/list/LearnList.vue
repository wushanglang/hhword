<template>
  <div class="wrapper" v-if="wordList.length">
    <RecycleScroller
      ref="scroller"
      class="scroller"
      :items="wordList"
      :item-size="54"
      :grid-items="2"
      :item-secondary-size="350"
    >
      <template #default="{ item, index }">
        <article onclick="dialog.showModal()" :class="fetchClass(index)" @click="playClick(index)">
          {{ item.word }}
        </article>
      </template>
    </RecycleScroller>

    <dialog id="dialog" onclick="dialog.close()">
      <article v-if="dialogWord" @click="$event.stopPropagation()">
        <div class="name" style="display: flex">
          <span>{{ dialogWord.word }}</span>
          <div class="status">
            <div class="iconfont swap" @click="switchLike(dialogWord)">
              <span :class="dialogWord.likeTag ? 'positive' : ''">&#xe68a;</span>
            </div>
            <div class="iconfont swap" @click="switchComplete(dialogWord)">
              <span :class="dialogWord.completeTag ? 'positive' : ''">&#xe64a;</span>
            </div>
            <div
              v-if="nameIndex === 'reviewIndex'"
              class="iconfont swap"
              @click="dialogWord.keepTag = !dialogWord.keepTag"
            >
              <span :class="dialogWord.keepTag ? 'positive' : ''"><strong>K</strong></span>
            </div>
          </div>
        </div>
        <div class="info">
          <div @click="speech(dialogWord.word)" v-if="dialogWord.voice">
            <div style="cursor: pointer">
              /{{ dialogWord.voice }}/
              <span class="iconfont">&#xe654; </span>
            </div>
          </div>
          <div>
            <div v-for="(tran, index) in dialogWord.tran" :key="index">
              <p>{{ tran.pos }}. {{ tran.cn }}</p>
            </div>
          </div>
          <div v-if="dialogWord.sentence && dialogWord.sentence.length">
            <ul v-for="(sentence, index) in dialogWord.sentence" :key="index">
              <li>
                <div>{{ sentence.en }}</div>
                <div>{{ sentence.cn }}</div>
              </li>
            </ul>
          </div>
          <div v-if="dialogWord.phrase && dialogWord.phrase.length">
            <ul v-for="(phrase, index) in dialogWord.phrase" :key="index">
              <li>{{ phrase.en }} &emsp;{{ phrase.cn }}</li>
            </ul>
          </div>
        </div>
      </article>
    </dialog>
  </div>
</template>

<script setup>
import { onMounted, watch, defineProps, ref } from 'vue'
import {
  cur,
  chars,
  wordIndex,
  charIndex,
  wordList,
  switchLike,
  switchComplete
} from '../../util/wordUtil'
import { speech } from '../../util/sound'
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps(['nameIndex']) // 索引名字
let nameIndex = props.nameIndex

// set empty then init：wordList, cur, wordIndex, chars
const dictId = localStorage.getItem('dictId')
const initData = async () => {
  wordList.value = chars.value = []
  cur.value = null
  if (nameIndex === 'learnIndex') {
    wordList.value = await window.word.listLearnByDictId(dictId)
  } else if (nameIndex === 'reviewIndex') {
    wordList.value = await window.word.listReviewByDictId()
  }
  if (wordList.value.length == 0) {
    router.push('/')
    return
  }
  updateWord(0)
}

function submit() {
  let ids = wordList.value.map((word) => word.id).join(',')
  let tmpIds = wordList.value
    .filter((word) => word.completeTag === 0)
    .map((word) => word.id)
    .join(',')

  if (nameIndex === 'reviewIndex') {
    localStorage.setItem('reviewIds', (localStorage.getItem('reviewIds') || '-1') + ',' + tmpIds)
    let keepList = wordList.value.filter((word) => word.keepTag === true).map((word) => word.id)
    router.push({
      path: '/finish',
      query: { ids: ids, keepList: JSON.stringify(keepList), path: 'review' }
    })
  } else if (nameIndex === 'learnIndex') {
    localStorage.setItem('learnIds', (localStorage.getItem('learnIds') || '-1') + ',' + tmpIds)
    router.push({ path: '/finish', query: { ids: ids, path: 'learn' } })
  }
}

let dialogWord = ref(null)
function playClick(index) {
  if (index >= wordList.value.length || index < 0) return // 越界
  dialogWord.value = wordList.value[index]
  window.word.fetchContentByWordId(dialogWord.value.id).then((data) => {
    let tmp = JSON.parse(data.content)
    dialogWord.value.voice = tmp.voice
    dialogWord.value.tran = tmp.tran
    dialogWord.value.phrase = tmp.phrase
    dialogWord.value.sentence = tmp.sentence
  })
  speech(dialogWord.value.word)
}

// 1、updateWord：边界维护，完成跳转，更新cur，cur.content, wordIndex，chars, charIndex
// 2、speech, scroll
function updateWord(index) {
  if (wordList.value.length == 0) return
  if (index < 0) index = 0

  // if end
  if (wordList.value.length <= index) {
    submit()
    return
  }

  wordIndex.value = index
  cur.value = wordList.value[index]
  window.word.fetchContentByWordId(cur.value.id).then((data) => {
    let tmp = JSON.parse(data.content)
    cur.value.voice = tmp.voice
    cur.value.tran = tmp.tran
    cur.value.phrase = tmp.phrase
    cur.value.sentence = tmp.sentence
  })

  chars.value = []
  for (let i = 0; i < cur.value.word.length; i++) chars.value.push(cur.value.word[i])
  charIndex.value = 0

  speech(cur.value.word)
}

function fetchClass(index) {
  if (index == wordIndex.value) return 'positive item border'
  if (wordList.value[index].completeTag) return 'item complete'
  return 'item'
}

onMounted(() => {
  initData()
})

watch(wordIndex, (newValue) => updateWord(newValue))
</script>


<style scoped>
.name {
  font-size: 35px;
}
</style>
