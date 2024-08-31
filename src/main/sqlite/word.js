import { query, querySingle, run } from './dbUtil';
import Database from 'better-sqlite3';
const db = new Database('resources/tw.db');

// 
export function listByDictId(params) {
  const sql = `SELECT w.id, w.word, w.completeTag, w.likeTag, wc.content FROM dict_map_${params} mp JOIN word w ON w.id = mp.id LEFT JOIN word_content wc ON wc.id = w.id WHERE w.completeTag = 0`;
  return query(db, sql);
}
// 
export function listByIds(params) {
  const sql = `SELECT w.id, w.word, w.completeTag, w.likeTag, w.reviewCycle, wc.content FROM word w JOIN word_content wc ON w.id = wc.id WHERE w.id IN (${params})  ORDER BY reviewTimestamp ASC`;
  return query(db, sql);
}
export function listToday(params) {
  const sql = 'SELECT w.id, w.word, w.completeTag, w.likeTag, wc.content FROM word w JOIN word_content wc ON w.id = wc.id WHERE ? < w.lastTimestamp AND w.lastTimestamp < ? ORDER BY lastTimestamp DESC'
  return query(db, sql, [params, params + 86400000]);
}
// 
export function listAllByDictId(params) {
  const sql = `SELECT w.id, w.word, w.completeTag, w.likeTag FROM dict_map_${params} mp JOIN word w ON w.id = mp.id`;
  return query(db, sql);
}
// 
export function listLikeByDictId(params) {
  const sql = `SELECT w.id, w.word, w.completeTag, w.likeTag FROM dict_map_${params} mp JOIN word w ON w.id = mp.id WHERE w.likeTag = 1`;
  return query(db, sql);
}
// 
export function listCompleteByDictId(params) {
  const sql = `SELECT w.id, w.word, w.completeTag, w.likeTag FROM dict_map_${params} mp JOIN word w ON w.id = mp.id WHERE w.completeTag = 1`;
  return query(db, sql);
}
// 
export function listLearnByDictId(params) {
  const sql = `SELECT w.id, w.word, w.completeTag, w.likeTag FROM dict_map_${params} mp JOIN word w ON w.id = mp.id WHERE w.completeTag = 0 AND reviewTimestamp = -1 LIMIT 20`;
  return query(db, sql);
}
// 
export function listReviewByDictId() {
  const currentTimestamp = Date.now();
  const sql = `SELECT id, word, completeTag, likeTag, reviewCycle FROM word 
             WHERE reviewCycle < 7 AND completeTag = 0 AND reviewTimestamp <= ${currentTimestamp}
             ORDER BY reviewTimestamp ASC LIMIT 20`;
  return query(db, sql);
}

// 
export function fetchContentByWordId(params) {
  const sql = `SELECT content FROM word_content WHERE id = ?`;
  return querySingle(db, sql, [params]);
}
// 
export function fetchCount(params) {
  const currentTimestamp = Date.now();
  const reviewSql = `SELECT COUNT(*) count FROM word WHERE reviewCycle < 7 AND completeTag = 0 AND reviewTimestamp <= ${currentTimestamp}`;
  const reviewCount = querySingle(db, reviewSql).count;

  const learnSql = `SELECT COUNT(*) count FROM dict_map_${params} mp JOIN word w ON w.id = mp.id WHERE w.completeTag = 0 AND reviewCycle = 7 AND reviewTimestamp = -1`;
  const learnCount = querySingle(db, learnSql).count;

  const completeSql = `SELECT COUNT(*) count FROM dict_map_${params} mp JOIN word w ON w.id = mp.id WHERE w.completeTag = 1`;
  const completeCount = querySingle(db, completeSql).count;

  return { learnCount, completeCount, reviewCount };
}

// 
export function switchLike(params) {
  const sql = 'UPDATE word SET likeTag = 1 - likeTag WHERE id = ?';
  run(db, sql, [params]);
}
// 
export function switchComplete(params) {
  const sql = `UPDATE word SET completeTag = 1 - completeTag, reviewTimestamp = -1, reviewCycle = 7 WHERE id = ?`;
  run(db, sql, [params]);
}

const reviewCycleTimestamp = [
  12 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  2 * 24 * 60 * 60 * 1000,
  4 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  15 * 24 * 60 * 60 * 1000
];
// 
export function saveReviewTime(params) {
  const reviewTimestamp = Date.now() + reviewCycleTimestamp[0];
  const sql = `UPDATE word SET reviewTimestamp = ?, reviewCycle = 1 WHERE id = ?`;
  run(db, sql, [reviewTimestamp, params]);
}
// 
export function increReviewCycle(data) {
  const { id, cycle } = data;
  const newReviewTimestamp = Date.now() + reviewCycleTimestamp[cycle];
  const sql = `UPDATE word SET reviewTimestamp = ?, reviewCycle = reviewCycle + 1 WHERE id = ?`;
  run(db, sql, [newReviewTimestamp, id]);
}


export function listAll() {
  const sql = 'select id, word from word'
  return query(db, sql)
}

export function save(data) {
  const db = new Database('tw.db');
  let { word, content } = data
  const wordSql = `INSERT INTO word (word, completeTag, likeTag, reviewTimestamp, reviewCycle) VALUES(?, 0, 0, -1, 7)`
  console.log(wordSql)
  run(db, wordSql, word)
  const idSql = `select id from word where word = ?`
  let id = querySingle(db, idSql, word).id
  console.log(word, id, idSql)
  const contentSql = `INSERT INTO word_content (id, content) VALUES(?, ?)`
  run(db, contentSql, [id, content])
  db.close()
}