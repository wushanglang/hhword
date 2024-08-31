import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// window api
const api = {
  close: () => ipcRenderer.send('close'),
  minimize: () => ipcRenderer.send('minimize')
}

const dict = {
  getDictById: (params) => ipcRenderer.invoke('getDictById', { params })
  ,
  listClass: () => ipcRenderer.invoke('listClass')
  ,
  listByClassId: (params) => ipcRenderer.invoke('listByClassId', { params })
  ,
  saveDict: (ids, fileName, intro, dictIds, classId) => ipcRenderer.invoke('saveDict', { ids, fileName, intro, dictIds, classId })
  ,
  removeDictById: (params) => ipcRenderer.invoke('removeDictById', { params })
  ,
}

const word = {
  listAll: () => ipcRenderer.invoke('listAll')
  ,
  fetchCount: (params) => ipcRenderer.invoke('fetchCount', { params })
  ,
  listLearnByDictId: (params) => ipcRenderer.invoke('listLearnByDictId', { params })
  ,
  fetchContentByWordId: (params) => ipcRenderer.invoke('fetchContentByWordId', { params })
  ,
  switchLike: (params) => ipcRenderer.send('switchLike', { params })
  ,
  switchComplete: (params) => ipcRenderer.send('switchComplete', { params })
  ,
  saveReviewTime: (params) => ipcRenderer.invoke('saveReviewTime', { params })
  ,
  listByIds: (params) => ipcRenderer.invoke('listByIds', { params })
  ,
  listToday: (params) => ipcRenderer.invoke('listToday', { params })
  ,
  listReviewByDictId: (params) => ipcRenderer.invoke('listReviewByDictId', { params })
  ,
  increReviewCycle: (id, cycle) => ipcRenderer.invoke('increReviewCycle', { id, cycle })
  ,
  listByDictId: (params) => ipcRenderer.invoke('listByDictId', { params })
  ,
  listLikeByDictId: (params) => ipcRenderer.invoke('listLikeByDictId', { params })
  ,
  listAllByDictId: (params) => ipcRenderer.invoke('listAllByDictId', { params })
  ,
  listCompleteByDictId: (params) => ipcRenderer.invoke('listCompleteByDictId', { params })
  ,
  save: (word, content) => ipcRenderer.invoke('save', { word, content })
}

const count = {
  increTypeCount: (params) => ipcRenderer.send('increTypeCount', { params })
  ,
  getTodayCount: () => ipcRenderer.invoke('getTodayCount')
  ,
  getTotalCount: () => ipcRenderer.invoke('getTotalCount')
  ,
  yearCoutnList: () => ipcRenderer.invoke('yearCoutnList')
}

// Use `contextBridge` APIs to expose Electron APIs to renderer only if context isolation is enabled,
// otherwise just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('dict', dict)
    contextBridge.exposeInMainWorld('word', word)
    contextBridge.exposeInMainWorld('count', count)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  window.dict = dict
  window.word = word
  window.count = count
}
