import { ipcMain } from 'electron';
import { getDictById, listClass, listByClassId, saveDict, removeDictById } from './sqlite/dict'
import {
  save, listAll, fetchCount, listLearnByDictId, switchComplete, switchLike, fetchContentByWordId, saveReviewTime, listByIds, listToday, listReviewByDictId, increReviewCycle, listByDictId, listLikeByDictId, listAllByDictId, listCompleteByDictId
} from './sqlite/word'
import { yearCoutnList, increTypeCount, getTodayCount, getTotalCount } from './sqlite/count'

export function dictEventHandler() {
  ipcMain.handle('getDictById', async (_, data) => {
    return await getDictById(data.params);
  });
  ipcMain.handle('listClass', async (_) => {
    return await listClass();
  });
  ipcMain.handle('listByClassId', async (_, data) => {
    return await listByClassId(data.params);
  });
  ipcMain.handle('saveDict', async (_, data) => {
    return await saveDict(data);
  });
  ipcMain.handle('removeDictById', async (_, data) => {
    return await removeDictById(data.params);
  });
}

export function wordEventHandler() {
  ipcMain.handle('save', async (_, data) => {
    return await save(data);
  })
  ipcMain.handle('listAll', async (_) => {
    return await listAll();
  })
  ipcMain.handle('fetchCount', async (_, data) => {
    return await fetchCount(data.params);
  })
  ipcMain.handle('listLearnByDictId', async (_, data) => {
    return await listLearnByDictId(data.params);
  })
  ipcMain.handle('fetchContentByWordId', async (_, data) => {
    return await fetchContentByWordId(data.params);
  })
  ipcMain.on('switchLike', (_, data) => {
    switchLike(data.params);
  })
  ipcMain.on('switchComplete', (_, data) => {
    switchComplete(data.params);
  })
  ipcMain.handle('saveReviewTime', (_, data) => {
    saveReviewTime(data.params);
  });
  ipcMain.handle('listByIds', async (_, data) => {
    return await listByIds(data.params);
  });
  ipcMain.handle('listToday', async (_, data) => {
    return await listToday(data.params);
  });
  ipcMain.handle('listReviewByDictId', async (_, data) => {
    return await listReviewByDictId(data.params);
  });
  ipcMain.handle('increReviewCycle', (_, data) => {
    increReviewCycle(data);
  });
  ipcMain.handle('listByDictId', (_, data) => {
    return listByDictId(data.params);
  });
  ipcMain.handle('listLikeByDictId', (_, data) => {
    return listLikeByDictId(data.params);
  });
  ipcMain.handle('listAllByDictId', (_, data) => {
    return listAllByDictId(data.params);
  });
  ipcMain.handle('listCompleteByDictId', (_, data) => {
    return listCompleteByDictId(data.params);
  });
}

// cout api 
export function countEventHandler() {
  ipcMain.on('increTypeCount', (_, data) => {
    increTypeCount(data.params);
  });

  ipcMain.handle('getTodayCount', async (_) => {
    return await getTodayCount();
  });

  ipcMain.handle('getTotalCount', async (_) => {
    return await getTotalCount();
  });

  ipcMain.handle('yearCoutnList', async (_) => {
    return await yearCoutnList();
  });
}


// window api
export function apiHandler(mainWindow) {
  ipcMain.on('close', () => {
    mainWindow.close();
  });

  ipcMain.on('minimize', () => {
    mainWindow.minimize();
  });
}