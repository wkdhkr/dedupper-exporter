import { readFile } from "fs/promises";
import { singleton } from "tsyringe";
import config from "../config.js";
import DbService from "./DbService.js";

@singleton()
export default class HashCollectionService {
  constructor(private db: DbService) {}
  async collectHashes(): Promise<string[]> {
    const content = await readFile("hash.csv", "utf8");
    return content.split("\n").map((l) => l.replace("\r", "")).filter(Boolean);
  }

  async collectHashesFromDb(): Promise<string[]> {
    const rows = this.db.fetchRatedImageHashes(config.orientation);
    return rows.map((r) => r.hash);
  }
}
