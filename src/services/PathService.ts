import * as path from "path";
import { singleton } from "tsyringe";
import { MainViewerState } from "../../types/dedupper";
import { PathBundle } from "../../types/dedupperExporter";
import config from "../config.js";

@singleton()
export default class PathService {
  createHashPrefix(hash: string) {
    return `${hash[0] + hash[1]}`;
  }
  createProcessedPath(hash: string) {
    return path.join(
      config.outputDirPath,
      `status/processed/${this.createHashPrefix(hash)}/${hash}.txt`,
    );
  }

  createMissedPath(hash: string) {
    return path.join(
      config.outputDirPath,
      `status/missed/${this.createHashPrefix(hash)}/${hash}.txt`,
    );
  }

  detectNsfwType(state: MainViewerState) {
    const maxNsfwScore = Math.max(
      state.currentImage.neutral,
      state.currentImage.drawing,
      state.currentImage.hentai,
      // state.currentImage.hentai_porn,
      // state.currentImage.hentai_porn_sexy,
      // state.currentImage.hentai_sexy,
      state.currentImage.porn,
      // state.currentImage.porn_sexy,
      state.currentImage.sexy,
    );
    let nsfwType = "unknown";

    switch (maxNsfwScore) {
      case state.currentImage.neutral:
        nsfwType = "neutral";
        break;
      case state.currentImage.drawing:
        nsfwType = "drawing";
        break;
      case state.currentImage.hentai:
        nsfwType = "hentai";
        break;
      case state.currentImage.porn:
        nsfwType = "porn";
        break;
      case state.currentImage.sexy:
        nsfwType = "sexy";
        break;
      default:
        break;
    }

    return nsfwType;
  }

  replacePathPattern(pattern: string, state: MainViewerState) {
    const d = new Date(state.currentImage.timestamp);
    return pattern.replaceAll(
      "%ORIENTATION%",
      config.orientation,
    ).replaceAll(
      "%NSFW%",
      this.detectNsfwType(state),
    ).replaceAll(
      "%RATING%",
      `${state.currentImage.rating}`,
    )
      .replaceAll(
        "%YEAR%",
        `${d.getFullYear()}`,
      )
      .replaceAll(
        "%MONTH%",
        `${d.getMonth() + 1}`.padStart(2),
      )
      .replaceAll(
        "%HASH%",
        state.currentImage.hash,
      );
  }

  createImagePath(state: MainViewerState) {
    return path.join(
      config.outputDirPath,
      "image/",
      (this.replacePathPattern(config.dirPattern, state) + "/").replace(
        /\/\/$/,
        "/",
      ),
      this.replacePathPattern(config.filePattern, state) + "." +
        config.extension,
    );
  }

  createPathBundle(state: MainViewerState): PathBundle {
    const imagePath = this.createImagePath(state);
    return {
      processed: this.createProcessedPath(state.currentImage.hash),
      missed: this.createMissedPath(state.currentImage.hash),
      image: imagePath,
      imageDir: path.dirname(imagePath),
      png: imagePath.replace(new RegExp("\\." + config.extension + "$"), "") +
        ".png",
    };
  }
}
