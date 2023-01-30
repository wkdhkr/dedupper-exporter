import * as fs from "fs";
import * as os from "os";
import { parse } from "jsonc-parser";

const config: {
  headless: boolean;
  protocol: string;
  host: string;
  port: string;
  orientation: string;
  concurrency: number;
  quality: number;
  size: {
    portrait: {
      width: number;
      height: number;
    };
    landscape: {
      width: number;
      height: number;
    };
  };
  retry: number;
  // extension: "webp" | "png" | "jpg";
  extension: "webp";
} = {
  size: {
    portrait: {
      width: 1080,
      height: 1920,
    },
    landscape: {
      width: 1920,
      height: 1080,
    },
  },
  retry: 3,
  quality: 95,
  concurrency: os.cpus().length,
  extension: "webp",
  headless: true,
  protocol: "http",
  port: 80,
  orientation: "landscape",
  ...parse(
    fs.readFileSync("config.jsonc", "utf8"),
  ),
};
export default config;
