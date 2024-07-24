<template>
  <div style="margin: 0 1em 0 1em">
    <nav>
      <ul>
        <li v-for="classItem in classList" :key="classItem.id" @click="fetchDictList(classItem.id)">
          <a :class="selectId === classItem.id ? 'tab-active contrast' : 'contrast'">
            {{ classItem.name }}
          </a>
        </li>
      </ul>
      <button class="outline contrast" style="margin: 1rem" @click="uploadDict()">导入词典</button>
    </nav>
    <div style="display: flex; flex-wrap: wrap; gap: 1rem">
      <article v-for="dict in dictList" :key="dict.id" class="dictList" @click="selectDict(dict)">
        <div class="dict">
          <div>
            <p class="name">{{ dict.name }}</p>
            <p class="intro">{{ dict.intro }}</p>
            <div class="count">
              <span class="remove" @click.stop="showRemoveDialog(dict)">移除</span>
              {{ dict.wordCnt }} 词
            </div>
          </div>
        </div>
      </article>
    </div>

    <dialog id="remove" onclick="remove.close()">
      <article @click="$event.stopPropagation()" style="width: 25rem">
        确定移除该词典？
        <div class="opt">
          <button @click="hideModal" className="secondary">取消</button>
          <button @click="removeDict()">移除</button>
        </div>
      </article>
    </dialog>

    <dialog id="dialog" @click="hideModal()">
      <article style="max-width: 500px" @click="$event.stopPropagation()" v-if="tmpDict">
        <h4>确定更换该词典?</h4>
        <div style="display: flex; justify-content: space-between">
          <p>{{ tmpDict.name }}</p>
          <p>{{ tmpDict.wordCnt }} 词</p>
        </div>
        <div class="opt">
          <button @click="hideModal" className="secondary">取消</button>
          <button @click="submitDict()">确认</button>
        </div>
      </article>
    </dialog>

    <dialog id="submit" @click="cancelUpload()">
      <article @click="$event.stopPropagation()">
        <div>
          <h1>{{ fileName }}</h1>
          <p>{{ intro }}</p>

          <p>成功导入{{ ids.length }}单词</p>
        </div>
        <div class="opt">
          <button @click="cancelUpload()" className="secondary">取消</button>
          <button @click="submitUpload()">导入</button>
        </div>
      </article>
    </dialog>

    <dialog id="upload" @click="hideModal()">
      <article @click="$event.stopPropagation()" style="padding: 2rem 0; border-radius: 8px">
        <h6 style="text-align: center">由于涉及潜在的版权问题，请自行<a class="download" href="https://pan.quark.cn/s/2cd52df70709" target="_blank">下载词典</a>录入</h6>
        <div
          id="drop"
          @dragover.prevent
          @dragleave="resetDropZone"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          将<span style="color: var(--pico-primary)">excel</span>文件拖拽到此处或点击上传
        </div>
        <input type="file" id="fileInput" multiple ref="fileInput" @change="handleFileChange" />
      </article>
    </dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as XLSX from 'xlsx'
const { utils } = XLSX
let classList = ref(null)
let selectId = ref(null)
let dictList = ref(null)

onMounted(() => {
  fetchClass()
})

function fetchClass() {
  window.dict.listClass().then((data) => {
    classList.value = data
    if (data.length <= 0) return

    selectId.value = classList.value[0].id
    fetchDictList(selectId.value)
  })
}

function fetchDictList(id) {
  selectId.value = id
  window.dict.listByClassId(id).then((data) => {
    dictList.value = data
  })
}

let dictId = ref(null)
let tmpDict = ref(null)
function selectDict(dict) {
  dictId.value = dict.id
  tmpDict.value = dict
  document.getElementById('dialog').showModal()
}
function hideModal() {
  document.getElementById('remove').close()
  document.getElementById('dialog').close()
  document.getElementById('upload').close()
}
function uploadDict() {
  document.getElementById('upload').showModal()
}

function showRemoveDialog(dict) {
  dictId.value = dict.id
  document.getElementById('remove').showModal()
}
function removeDict() {
  window.dict.removeDictById(dictId.value).then(() => {
    hideModal()
    fetchDictList(selectId.value)
  })
}

import { useRouter } from 'vue-router'
const router = useRouter()
function submitDict() {
  localStorage.setItem('dictId', dictId.value)
  // 重置列表定位
  localStorage.setItem('TaskList', 0)
  localStorage.setItem('LikeList', 0)
  localStorage.setItem('TotalList', 0)
  localStorage.setItem('CompleteList', 0)
  router.push('/')
}

// FILE UPLOAD
const dropZone = ref(null)
const fileInput = ref(null)

const resetDropZone = () => {
  dropZone.value.style.backgroundColor = ''
}

const handleDrop = async (e) => {
  e.stopPropagation()
  e.preventDefault()

  const file = e.dataTransfer.files
  handleFiles(file)
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = () => {
  const files = fileInput.value.files
  handleFiles(files)
}

const handleFiles = (files) => {
  if (files.length > 1) {
    alert('仅支持上传一个文件')
    return
  }
  const file = files[0]
  if (
    file.type === 'application/vnd.ms-excel' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    readExcelFile(file)
  } else {
    alert('仅支持上传Excel文件')
  }
}

let fileName = ref('')
let intro = ref('')
let words = ref([])
let ids = ref([])
let failWords = ref([])
const readExcelFile = async (file) => {
  const reader = new FileReader()
  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result)
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    fileName.value = file.name.split('.').slice(0, -1).join('.')
    words.value = []
    jsonData.forEach((row, index) => {
      if (index === 0 && row[1]) {
        intro.value = row[1]
      }
      words.value.push(row[0])
    })
    window.word.listAll().then((data) => {
      collectIds(data)
    })
  }
  reader.readAsArrayBuffer(file)
}

const collectIds = (all) => {
  words.value.forEach((word) => {
    const match = all.find((item) => item.word === word)
    if (match) {
      ids.value.push(match.id)
    } else {
      failWords.value.push(word)
    }
  })
  hideModal()
  document.getElementById('submit').showModal()
}

function cancelUpload() {
  document.getElementById('submit').close()
  intro.value = ''
  words.value = []
  ids.value = []
  failWords.value = []
}
function submitUpload() {
  let dictIds = ''
  for (let i = 0; i < dictList.value.length; i++) {
    dictIds = dictIds + dictList.value[i].id + ';'
  }
  window.dict
    .saveDict(JSON.stringify(ids.value), fileName.value, intro.value, dictIds, selectId.value)
    .then(() => {
      cancelUpload()
      fetchDictList(selectId.value)
    })
}
</script>

<style scoped>
li {
  font-weight: bold;
  cursor: pointer;
}
.tab-active {
  text-decoration: underline;
  color: var(--pico-primary-background);
}
.dictList {
  display: flex;
  padding: 10px;
}
.dictList:hover {
  box-shadow: 4px 8px 15px rgba(166, 173, 187, 0.5);
  transition: 150ms;
}
.dict {
  position: relative;
  cursor: pointer;
  border-radius: 7px;
  display: flex;
  width: 390px;
  height: 180px;
}
.name {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  padding: 0;
}
.intro {
  margin-top: 10px;
  font-size: 16px;
}
.count {
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 17px;
}
.remove {
  color: rgb(255, 129, 129);
  cursor: pointer;
  font-weight: bold;
  margin-right: 1rem;
}
.remove:hover {
  color: rgb(255, 26, 26);
}

.opt {
  display: flex;
  justify-content: end;
  gap: 1rem;
  margin-top: 1.4rem;
}

#drop {
  user-select: none;
  width: 400px;
  height: 200px;
  border: 2px dashed var(--pico-h6-color);
  border-radius: 10px;
  text-align: center;
  line-height: 200px;
  font-size: 20px;
  color: var(--pico-color);
  margin: 0 auto;
  cursor: pointer;
  transition: 200ms;
}
#drop:hover {
  border-color: rgba(113, 100, 206, 0.849);
}
#fileInput {
  display: none;
}
.download {
  color: #6988e6;
  text-decoration-color:#6988e6;
}
.download:hover {
  color: #496dda;
  text-decoration-color: #496dda;
}
</style>