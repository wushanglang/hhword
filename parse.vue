
<template>
  <div>
    <input type="file" @change="handleFileUpload" />
    <button @click="exportToExcel">解析JSON文件</button>
    <ul>
      <li v-for="(word, index) in wordList" :key="index">{{ word }}</li>
    </ul>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
export default {
  data() {
    return {
      wordList: [], // 存储解析后的单词
      jsonFileContent: '' // 存储上传的JSON文件内容
    }
  },
  methods: {
    handleFileUpload(event) {
      this.wordList = []
      const file = event.target.files[0]
      if (file && file.type === 'application/json') {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.jsonFileContent = e.target.result
          // console.log(this.jsonFileContent)
          let tmp = this.jsonFileContent.split('\n')
          for (let i = 0; i < tmp.length - 1; i++) this.wordList.push(JSON.parse(tmp[i]).headWord)
          console.log(this.wordList)
        }
        reader.readAsText(file)
      } else {
        alert('请选择一个JSON文件')
      }
    },
    exportToExcel() {
      // 创建一个新的工作簿
      const wb = XLSX.utils.book_new()

      // 将 wordList 转换为 Excel 表格数据
      const ws_data = this.wordList.map((word) => [word]) // 每个单词作为一行
      const ws = XLSX.utils.aoa_to_sheet(ws_data)

      // 将工作表添加到工作簿中
      XLSX.utils.book_append_sheet(wb, ws, 'WordList')

      // 导出 Excel 文件
      XLSX.writeFile(wb, 'word_list.xlsx')
    }
  }
}
</script>

<style scoped>
input {
  display: block;
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 10px;
}
</style>
