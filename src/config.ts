import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { parse } from "jsonc-parser";
import { Option, program } from "commander";
import CliValidationUtil from "./utils/CliValidationUtil.js";

type CliOptions = {
  config?: string;
  host?: string;
  port?: number;
  orientation?: string;
  orientationRatio?: number;
  quality?: number;
  retry?: number;
  dbPath?: string;
  outputDirPath?: string;
  dirPattern?: string;
  filePattern?: string;
  processLimit?: number;
  extention?: string;
};

type Config = {
  headless: boolean;
  protocol: string;
  host: string;
  port: number;
  jpgEncoder: "guetzli" | "mozjpeg";
  orientation: string;
  orientationRatio: number;
  concurrency: number;
  qualityForJpg: number;
  qualityForWebp: number;
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
  dbPath: string;
  outputDirPath: string;
  dirPattern: string;
  filePattern: string;
  processLimit: number;
  extension: "webp" | "jpg";
};

program
  .option(
    "-c, --config <config file path>",
  )
  .option(
    "-H, --host <host>",
  ).option(
    "-p, --port <port>",
    "dedupper-viewer port number.",
    CliValidationUtil.parseInt,
  )
  .addOption(
    new Option("-o, --orientation <orientation>", "image orientation").choices([
      "landscape",
      "portrait",
    ]),
  )
  .option(
    "-r, --orientation-ratio <orientation ratio>",
    "This value divides the orientation of the image.",
    parseFloat,
  )
  .option(
    "-C, --concurrency <concurrency>",
    "The processing is parallelized by this value.",
    CliValidationUtil.parseInt,
  )
  .option(
    "-q, --quality <quality>",
    "Output file quality. (1 to 100)",
    CliValidationUtil.parseInt,
  )
  .option(
    "-R, --retry <retry count>",
    "If an error occurs during image rendering, retry this number of times.",
    CliValidationUtil.parseInt,
  )
  .option(
    "-d, --db-path <db file path>",
  )
  .option(
    "-O, --output-dir-path <output dir path>",
  )
  .option(
    "-D, --dirPattern <dir pattern>",
  )
  .option(
    "-F, --filePattern <file pattern>",
  )
  .option(
    "-l, --process-limit <process limit count>",
    null,
    CliValidationUtil.parseInt,
  )
  .addOption(
    new Option("-e, --extension <extension>", "image file extension").choices([
      "webp",
      "jpg",
    ]),
  );

program.parse();

const cliOptions: CliOptions = program.opts();

// console.log(cliOptions);
// process.exit();

const config: Config = {
  ...{
    headless: true,
    protocol: "http",
    host: "localhost",
    port: 80,
    jpgEncoder: "mozjpeg",
    orientation: "landscape",
    orientationRatio: 0.7,
    concurrency: os.cpus().length,
    qualityForJpg: 90,
    qualityForWebp: 90,
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
    dbPath: path.join(
      process.env["USERPROFILE"],
      "/.dedupper/db/TYPE_IMAGE.sqlite3",
    ),
    outputDirPath: "dist",
    dirPattern: "%ORIENTATION%/%ORIENTATION%_%NSFW%_%RATING%",
    filePattern: "%HASH%",
    processLimit: 1000000,
    extension: "jpg",
    // extension: "webp",
  } as Config,
  ...parse(
    fs.readFileSync(cliOptions.config || "config.jsonc", "utf8"),
  ),
  ...cliOptions,
  ...{
    qualityForJpg: cliOptions.quality,
    qualityForWebp: cliOptions.quality,
  },
};
export default config;
