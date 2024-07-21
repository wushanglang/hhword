<template>
  <div class="con">
    <div class="left">
      <div>
        <span class="iconfont" @click="router.push('/')">&#xe644;</span>
      </div>
      <div @click="router.push('/dictList')">
        <span class="iconfont">&#xe601;</span>
      </div>
      <div @click="toggleTheme()">
        <span v-if="currentTheme === 'dark'" class="iconfont">&#xe624;</span>
        <span v-else class="iconfont">&#xe67c;</span>
      </div>
    </div>

    <div>欢欢单词</div>

    <div class="right">
      <div>
        <span class="iconfont" @click="minimize">&#xe63b;</span>
      </div>
      <div>
        <span class="iconfont close" @click="close">&#xe600;</span>
      </div>
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
  padding: 5px 10px;
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