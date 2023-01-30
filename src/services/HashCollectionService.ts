import { readFile } from "fs/promises";
import { singleton } from "tsyringe";

@singleton()
export default class HashCollectionService {
  async collectHashes(): Promise<string[]> {
    const content = await readFile("hash.csv", "utf8");
    return content.split("\n").map((l) => l.replace("\r", "")).filter(Boolean);
  }
}
