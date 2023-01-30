import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import * as path from "path";
import { singleton } from "tsyringe";
import config from "../config.js";

@singleton()
export default class ImageMinService {
  async convertToWebp(from: string, to: string) {
    return await imagemin([from], {
      destination: path.dirname(to),
      plugins: [
        imageminWebp({ quality: config.quality }),
      ],
    });
  }
}
