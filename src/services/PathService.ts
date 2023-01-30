import * as path from "path";
import { singleton } from "tsyringe";
import { MainViewerState } from "../../types/dedupper";
import config from "../config.js";

@singleton()
export default class PathService {
  createHashPrefix(hash: string) {
    return `${hash[0] + hash[1]}`;
  }
  createProcessedPath(hash: string) {
    return `dist/status/processed/${this.createHashPrefix(hash)}/${hash}.txt`;
  }

  createMissedPath(hash: string) {
    return `dist/status/missed/${this.createHashPrefix(hash)}/${hash}.txt`;
  }

  createImagePath(state: MainViewerState) {
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

    const d = new Date(state.currentImage.timestamp);
    // const datePath = d.getFullYear() + (d.getMonth() < 6 ? "h1" : "h2");
    const datePath = d.getFullYear();

    return [
      "dist/image/",
      config.orientation + "/",
      `${datePath}/${state.currentImage.rating}/${nsfwType}/${state.currentImage.hash}.${config.extension}`,
    ].join("");
  }

  createPathBundle(state: MainViewerState) {
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
