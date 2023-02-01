import { lstat, mkdir, rm, stat, writeFile } from "fs/promises";
import * as path from "path";
import { singleton } from "tsyringe";

@singleton()
export default class FileService {
  async isExists(filePath: string) {
    try {
      const isFile = (await lstat(filePath)).isFile();
      if (isFile) {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  async touch(filePath: string) {
    await this.prepareDir(filePath);
    return writeFile(filePath, "");
  }

  async writeFile(filePath: string, content: string) {
    await this.prepareDir(filePath);
    return writeFile(filePath, content);
  }

  async prepareDir(filePath: string) {
    await this.mkdir(path.dirname(filePath));
  }

  async mkdir(dirPath: string) {
    return await mkdir(dirPath, {
      recursive: true,
    });
  }

  async delete(filePath: string | null) {
    if (filePath && await this.isExists(filePath)) {
      return rm(filePath);
    }
  }

  async stat(filePath: string) {
    if (filePath && await this.isExists(filePath)) {
      return stat(filePath);
    }
    return null;
  }
}
