export function switchComplete(word) {
  word.completeTag = !word.completeTag
  window.word.switchComplete(word.id)
}

export function switchLike(word) {
  word.likeTag = !word.likeTag
  window.word.switchLike(word.id)
}

export function highlightWords(sentence, key) {
  const regex = new RegExp('(' + key + ')', 'g')
  return sentence
    .replace(regex, '<strong style="text-decoration: underline;">$1</strong>')
}


import { ref } from 'vue'
// 当前索引
export let wordIndex = ref(0);
// 索引单词
export let cur = ref({ likeTag: false, completeTag: false });
// 单词列表 
export let wordList = ref([]);
// 当前单词字符
export let chars = ref([])
// 拼写字符索引
export let charIndex = ref(0)

// 初始化index=0 || 设置缓存
export function initIndex(name) {
  wordIndex.value = 0;
  if (localStorage.getItem(name))
    wordIndex.value = parseInt(localStorage.getItem(name))
  if (wordIndex.value >= wordList.length)
    wordIndex.value = wordList.length - 1
}