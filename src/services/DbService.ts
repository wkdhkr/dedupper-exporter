import { singleton } from "tsyringe";
import Database from "better-sqlite3";
import config from "../config.js";

@singleton()
export default class DbService {
  db = new Database(config.dbPath, {});

  fetchRatedImageHashes(
    orientation: string,
    minRating = 2,
  ): { hash: string }[] {
    const orientationCondition = orientation === "portrait"
      ? "< " + config.orientationRatio
      : ">= " + config.orientationRatio;
    const statement = this.db.prepare(`
select process_state.hash from process_state
inner join hash on hash.hash = process_state.hash
where
process_state.rating >= ${minRating}
and process_state.missing < -1
and hash.ratio ${orientationCondition}
limit ${config.processLimit}
`);
    return statement.all();
  }
}
