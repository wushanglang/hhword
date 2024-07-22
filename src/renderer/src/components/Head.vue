<template>
  <div class="con">
    <div class="left">
      <div class="iconfont" @click="router.push('/')">&#xe644;</div>
      <div @click="router.push('/dictList')" class="iconfont">&#xe601;</div>
      <div @click="toggleTheme()">
        <div v-if="currentTheme === 'dark'" class="iconfont">&#xe624;</div>
        <div v-else class="iconfont">&#xe67c;</div>
      </div>
    </div>

    <div>欢欢单词</div>

    <div class="right"> 
      <div class="iconfont" @click="minimize">&#xe63b;</div>
      <div class="iconfont close" @click="close">&#xe600;</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
let currentTheme = ref(null)

onMounted(() => {
  currentTheme.value = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', currentTheme.value)
})

function toggleTheme() {
  currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  localStorage.setItem('theme', currentTheme.value)
}
function minimize() {
  window.api.minimize()
}
function close() {
  window.api.close()
}
</script>

<style scoped>
.con {
  width: 100%;
  display: flex;
  justify-content: space-between;
  -webkit-app-region: drag;
  user-select: none;
  background: var(--pico-code-background-color);
}
.left,
.right {
  -webkit-app-region: no-drag;
  display: flex;
}
.iconfont {
  font-size: 20px;
  padding: 0 10px;
  cursor: pointer;
  transition: 150ms;
}
.iconfont:hover {
  color: var(--pico-h1-color);
  background-color: var(--pico-form-element-selected-background-color);
}
.close:hover {
  background: #ff4848e7;
}
</style>