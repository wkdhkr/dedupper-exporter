import imagemin from "imagemin";
import sharp from "sharp";
import { execFile, ExecFileException } from "node:child_process";
import guetzli from "guetzli";
import imageminWebp from "imagemin-webp";
import * as path from "path";
import { singleton } from "tsyringe";
import config from "../config.js";

@singleton()
export default class ImageMinService {
  normalizePath(filePath: string) {
    return filePath.replaceAll("\\", "/");
  }
  async optimize(from: string, to: string) {
    const fixedFrom = this.normalizePath(from);
    if (config.extension === "webp") {
      await imagemin([fixedFrom], {
        destination: path.dirname(to),
        plugins: [
          imageminWebp({ quality: config.qualityForWebp }),
        ],
      });
      return;
    }
    if (config.extension === "jpg") {
      if (config.jpgEncoder === "guetzli") {
        await new Promise((resolve) => {
          execFile(
            guetzli,
            [
              "--quality",
              `${config.qualityForJpg}`,
              this.normalizePath(path.resolve(from)),
              this.normalizePath(path.resolve(to)),
            ],
            (error: ExecFileException) => {
              if (error) {
                throw error;
              }
              resolve(true);
            },
          );
        });
      } else if (config.jpgEncoder === "mozjpeg") {
        await sharp(fixedFrom)
          .jpeg({
            quality: config.qualityForJpg,
            mozjpeg: true,
            progressive: true,
          })
          .toFile(to);
      }
    }
  }
}
