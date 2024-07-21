function query(db, sql, params = []) {
  return db.prepare(sql).all(params);
}

function querySingle(db, sql, params = []) {
  return db.prepare(sql).get(params);
}

function run(db, sql, params = []) {
  return db.prepare(sql).run(params);
}

export { query, querySingle, run };
