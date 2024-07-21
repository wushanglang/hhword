import { query, querySingle, run } from './dbUtil';
import Database from 'better-sqlite3';
const db = new Database('resources/tw.db');

// 
export function getDictById(params) {
  const sql = "SELECT id, name, wordCnt, intro FROM dict WHERE id = ?";
  return querySingle(db, sql, [params]);
}
// 
export function listClass() {
  const sql = "SELECT id, dictId, name FROM dict_class";

  return query(db, sql);
}
// 
export function listByClassId(params) {
  const classSql = `SELECT id, dictId, name FROM dict_class WHERE id = ?`;
  const row = querySingle(db, classSql, [params]);
  if (!row || !row.dictId) return [];

  const ids = row.dictId.split(';');
  const placeholders = ids.map(() => '?').join(', ');
  const dictSql = `SELECT * FROM dict WHERE id IN (${placeholders})`;
  return query(db, dictSql, ids);
}

export function saveDict(params) {
  let { ids, fileName, intro, dictIds, classId } = params
  ids = JSON.parse(ids)
  let timestamp = Date.now();

  dictIds = dictIds + timestamp 
  let classSql = 'UPDATE dict_class SET dictId=? WHERE id=?'
  run(db, classSql, [dictIds, classId])
  // 插入dict
  const dictSql = 'INSERT INTO dict (id, name, wordCnt, intro) VALUES(?, ?, ?, ?)'
  run(db, dictSql, [timestamp, fileName, ids.length, intro])
  // 建表
  let tableName = `dict_map_${timestamp}`
  db.exec(`CREATE TABLE ${tableName} (id INTEGER)`)
  // 批量插入dict_map_dictId
  let placeholders = ids.map(() => '(?)').join(',')
  let mapSql = `INSERT INTO ${tableName} (id) VALUES ${placeholders}`
  run(db, mapSql, ids)

  return true;
}

export function removeDictById(params) {
  console.log(params)
  let removeDictSql = 'DELETE FROM dict WHERE id=?'
  // run()
  run(db, removeDictSql, params)
  let dropSql = `DROP TABLE IF EXISTS dict_map_${params}`
  run(db, dropSql)
}