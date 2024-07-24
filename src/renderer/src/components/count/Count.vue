<template>
  <article class="con">
    <div style="user-select: none">
      <div class="heat-map" style="display: flex; flex-direction: column; align-items: center">
        <div
          class="months"
          style="display: flex; justify-content: center; font-size: 14px; padding-bottom: 0.5em"
        >
          <div v-for="(month, index) in months" :key="index" :style="{ width: month.width }">
            {{ month.name }}
          </div>
        </div>

        <div style="display: flex; justify-content: center">
          <div style="font-size: 14px; padding: 0 0.4em 0 0.4em" class="week">
            <div>一</div>
            <div>三</div>
            <div>五</div>
            <div>日</div>
          </div>

          <div v-if="list.length">
            <div v-for="(row, rowIndex) in 7" :key="rowIndex" style="display: flex">
              <div v-for="(col, colIndex) in 54" :key="colIndex" class="cell-container">
                <div class="square" :style="checkRange(rowIndex, colIndex)">
                  <span
                    class="tooltip"
                    v-if="lIndex <= colIndex * 7 + rowIndex && colIndex * 7 + rowIndex <= rIndex"
                    >{{ tooltip(rowIndex, colIndex) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="display: flex; font-size: 18px">
        <span style="margin-left: 1.5em">
          最近一年练习: {{ totalCount }}次, 今日练习: {{ todayCount }}次</span
        >
        <div class="sqr">
          Less &ThinSpace;
          <div style="background-color: #ecf3e9"></div>
          <div style="background-color: #defc85"></div>
          <div style="background-color: #c1f335"></div>
          <div style="background-color: #a5d601"></div>
          <div style="background-color: #8eb901"></div>
          &ThinSpace;&ThinSpace;More
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { onMounted, ref } from 'vue'

let map = ref(null)
let rIndex = ref(0)
let lIndex = ref(0)
let list = ref([])
let todayCount = ref(0)
let totalCount = ref(0)
let months = ref([])

onMounted(() => {
  window.count.yearCoutnList().then((data) => {
    map.value = {}
    for (let i = 0; i < data.length; i++) {
      map.value[data[i].dayTimestamp] = data[i].cnt
      totalCount.value += data[i].cnt
    }
    const yearTimestamp = 365 * 24 * 3600000
    const currentTimestamp = new Date().setHours(0, 0, 0, 0)
    const lastYearTimestamp = currentTimestamp - yearTimestamp
    let weekday = new Date().getDay()
    lIndex.value = weekday === 1 ? 6 : (weekday + 5) % 7
    rIndex.value = 365 + lIndex.value
    for (let time = lastYearTimestamp; time <= currentTimestamp; time += 3600 * 24 * 1000) {
      let cnt = map.value[time] ? map.value[time] : 0
      list.value.push([time, cnt])
      if (time === currentTimestamp) todayCount.value = cnt
    }
    map.value = null

    calculateMonths()
  })
})

function interpolateColor(color1, color2, ratio) {
  const hex = (x) => {
    x = x.toString(16)
    return x.length === 1 ? '0' + x : x
  }

  const r = Math.ceil(
    parseInt(color2.substring(1, 3), 16) * ratio +
      parseInt(color1.substring(1, 3), 16) * (1 - ratio)
  )
  const g = Math.ceil(
    parseInt(color2.substring(3, 5), 16) * ratio +
      parseInt(color1.substring(3, 5), 16) * (1 - ratio)
  )
  const b = Math.ceil(
    parseInt(color2.substring(5, 7), 16) * ratio +
      parseInt(color1.substring(5, 7), 16) * (1 - ratio)
  )

  return `#${hex(r)}${hex(g)}${hex(b)}`
}

function getBackgroundColor(value) {
  const ranges = [
    { min: 0, max: 150, color1: '#ecf3e9', color2: '#defc85' },
    { min: 150, max: 300, color1: '#defc85', color2: '#c1f335' },
    { min: 300, max: 450, color1: '#c1f335', color2: '#a5d601' },
    { min: 450, max: Infinity, color1: '#a5d601', color2: '#8eb901' }
  ]

  for (const range of ranges) {
    if (value >= range.min && value <= range.max) {
      const ratio = (value - range.min) / (range.max - range.min)
      return interpolateColor(range.color1, range.color2, ratio)
    }
  }
  return '#ecf3e9'
}

function checkRange(row, col) {
  const dateIndex = col * 7 + row
  if (lIndex.value <= dateIndex && dateIndex <= rIndex.value) {
    const value = list.value[dateIndex - lIndex.value][1]
    return { backgroundColor: getBackgroundColor(value) }
  }
  return { backgroundColor: 'transparent' }
}

function tooltip(row, col) {
  const dateIndex = col * 7 + row
  if (lIndex.value <= dateIndex && dateIndex <= rIndex.value)
    return (
      new Date(list.value[dateIndex - lIndex.value][0] + 24 * 3600000)
        .toISOString()
        .substring(0, 10) +
      ', ' +
      list.value[dateIndex - lIndex.value][1] +
      ' type'
    )
}

function calculateMonths() {
  months.value = []
  let currentMonth = new Date(list.value[0][0]).getMonth()
  let currentMonthStartIndex = 0

  for (let i = 0; i < list.value.length; i++) {
    let date = new Date(list.value[i][0])
    if (date.getMonth() !== currentMonth) {
      let daysInMonth = i - currentMonthStartIndex
      if (daysInMonth >= 7) {
        let monthName = new Date(list.value[currentMonthStartIndex][0]).toLocaleString('default', {
          month: 'short'
        })
        let monthWidth = (daysInMonth * 1.1) / 7 + 'rem'
        months.value.push({ name: monthName, width: monthWidth })
      }
      currentMonth = date.getMonth()
      currentMonthStartIndex = i
    }
  }

  let finalDaysInMonth = list.value.length - currentMonthStartIndex
  if (finalDaysInMonth >= 7) {
    let monthName = new Date(list.value[currentMonthStartIndex][0]).toLocaleString('default', {
      month: 'short'
    })
    let monthWidth = (finalDaysInMonth * 1.1) / 7 + 'rem'
    months.value.push({ name: monthName, width: monthWidth })
  }
}
</script>

<style scoped>
.con {
  margin-top: 1rem !important;
}
.square {
  font-size: 0.5rem;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 0.2rem;
  margin: 0.15rem;
  background-color: transplant;
}

.cell-container {
  position: relative;
}

.tooltip {
  display: none;
  position: absolute;
  color: white;
  background-color: rgba(37, 34, 34, 0.9);
  font-size: 13px;
  border-radius: 0.1rem;
  padding: 5px;
  bottom: 135%;
  white-space: nowrap;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.cell-container:hover .tooltip {
  display: block;
}

.week > div {
  margin-bottom: 1.1rem;
}

.months > div {
  text-align: center;
}

.sqr > div {
  width: 1rem;
  height: 1rem;
}

.sqr {
  margin-left: auto;
  margin-right: 3em;
  display: flex;
}
</style>
