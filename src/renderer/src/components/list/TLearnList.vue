<template>
  <div class="wrapper">
    <RecycleScroller
      ref="scroller"
      class="scroller"
      :items="wordList"
      :item-size="54"
      :grid-items="2"
      :item-secondary-size="345"
    >
      <template #default="{ item, index }">
        <article 
          :class="index === wordIndex ? 'positive item border' : 'item'"
          @click="updateWord(index)"
        >
          {{ item.word }}
        </article>
      </template>
    </RecycleScroller>
  </div>
</template>

<script>
export default {
  name: 'TLearnList'
}
</script>

<script setup>
import { onMounted, watch } from 'vue'
import { wordList, cur, wordIndex, chars, charIndex } from '../../util/wordUtil'
import { scrollToItem, scroller } from '../../util/common'
import { speech } from '../../util/sound'

let ids = localStorage.getItem('learnIds')
// set empty then init：wordList, cur, wordIndex, chars
const initData = async () => {
  wordList.value = chars.value = []
  // 防止status抖动
  cur.value = { likeTag: false, completeTag: false }
  wordList.value = await window.word.listByIds(ids)

  updateWord(0)
}

// 1、updateWord：边界维护，更新cur，cur.content, wordIndex，chars, charIndex
// 2、speech, scroll
function updateWord(index) {
  if (wordList.value.length == 0) return
  if (index < 0) index = 0
  if (index >= wordList.value.length) index = wordList.value.length - 1

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
  scrollToItem(wordIndex.value)
}

onMounted(() => {
  initData()
  setTimeout(() => scrollToItem(wordIndex.value), 50)
})

watch(wordIndex, (newValue) => {
  updateWord(newValue)
})
</script>


<style scoped>
.wrapper {
  height: 87vh;
  display: flex;
  flex-direction: column;
}
.item {
  max-width: 340px;
}
</style>
