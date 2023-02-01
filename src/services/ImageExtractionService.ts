import PQueue from "p-queue";
import { Browser, chromium, Page } from "playwright";
import { singleton } from "tsyringe";
import { MainViewerState } from "../../types/dedupper.js";
import { PathBundle } from "../../types/dedupperExporter.js";
import config from "../config.js";
import DedupperViewerUtil from "../utils/DedupperViewerUtil.js";
import FileService from "./FileService.js";
import ImageMinService from "./ImageMinService.js";
import PathService from "./PathService.js";

@singleton()
export default class ImageExtractionService {
  _browser: Browser | null = null;
  _queue: PQueue | null = null;

  constructor(
    private fileService?: FileService,
    private pathService?: PathService,
    private imageMinService?: ImageMinService,
  ) {}

  async init() {
    this._browser = await chromium.launch({
      headless: config.headless,
      args: ["--disable-web-security"],
    });
    const Queue = (await import("p-queue")).default;
    this._queue = new Queue({ concurrency: config.concurrency });
    await this.fileService.mkdir("dist");
    return this;
  }

  async close() {
    this.browser.close();
  }

  get browser() {
    if (this._browser) {
      return this._browser;
    }
    throw new Error("Browser not initialized.");
  }

  get queue() {
    if (this._queue) {
      return this._queue;
    }
    throw new Error("Queue not initialized.");
  }

  async extractImages(hashes: string[]) {
    await Promise.all(hashes.map((h) => this.queue.add(() => this.process(h))));
  }

  createImagePath(hash: string) {
    return "dist/" + hash + ".png";
  }

  createDummyMainViewerState(hash: string) {
    return ({
      faces: [],
      currentImage: {
        hash,
        rating: 0,
        timestamp: 0,
        neutral: 0,
        drawing: 0,
        hentai: 0,
        hentai_porn: 0,
        hentai_porn_sexy: 0,
        hentai_sexy: 0,
        porn: 0,
        porn_sexy: 0,
        sexy: 0,
        t1: 0,
      },
    } as any) as MainViewerState;
  }

  validateMainViewerState(hash: string, state: MainViewerState) {
    if (!state.currentImage) {
      console.warn("image not found. hash = " + hash);
      return false;
    }
    if (state.currentImage.rating < 1) {
      console.warn("rating is 0. hash = " + hash);
      return false;
    }
    if (state.currentImage.t1) {
      console.warn("delete flag detected. hash = " + hash);
      return false;
    }

    return true;
  }

  async isImageProcessed(hash: string) {
    return this.fileService.isExists(
      this.pathService.createPathBundle(this.createDummyMainViewerState(hash))
        .processed,
    );
  }

  async isImageMissed(hash: string) {
    return this.fileService.isExists(
      this.pathService.createPathBundle(this.createDummyMainViewerState(hash))
        .missed,
    );
  }

  async createMainViewerPage(hash: string) {
    const page = await this.browser.newPage();
    await page.setDefaultNavigationTimeout(1000 * 60 * 5);
    await page.setViewportSize(config.size[config.orientation]);
    await page.goto(DedupperViewerUtil.createMainViewerUrl(hash));
    await page.waitForLoadState("networkidle");

    return page;
  }

  async extractMainViewerFrame(page: Page) {
    const elementHandle = await page.$("#main-viewer-iframe");
    const frame = await elementHandle.contentFrame();
    /*
    await frame.locator(".viewer-toolbar").evaluate((element) =>
      element.style.display = "none"
    );
    await frame.locator(".viewer-main-container").evaluate((element) =>
      element.style.display = "none"
    );
    */
    return frame;
  }

  createStatusFileContents(state: MainViewerState, pb: PathBundle) {
    return JSON.stringify(
      {
        state: state.currentImage,
        paths: pb,
      },
      null,
      2,
    );
  }

  async process(hash: string, retry = 0) {
    let pngPath: string | null = null;

    try {
      if (await this.isImageProcessed(hash)) {
        return;
      }
      if (await this.isImageMissed(hash)) {
        return;
      }

      // console.info("process start. hash = " + hash);

      const page = await this.createMainViewerPage(hash);
      const frame = await this.extractMainViewerFrame(page);

      const state = await frame.evaluate(() => window["store"].getState());

      let pb = this.pathService.createPathBundle(
        this.createDummyMainViewerState(hash),
      );

      const statusFileContents = this.createStatusFileContents(
        state.mainViewer,
        pb,
      );

      if (
        (await this.validateMainViewerState(
          hash,
          state.mainViewer,
        )) === false
      ) {
        await this.fileService.writeFile(
          pb.missed,
          statusFileContents,
        );
        return;
      }

      pb = this.pathService.createPathBundle(state.mainViewer);

      // await page.waitForTimeout(1000 * 60 * 5);
      await Promise.all([
        this.fileService.prepareDir(pb.png),
        this.fileService.prepareDir(pb.image),
        // image rendering wait time
        page.waitForTimeout(1000 * 2),
      ]);
      pngPath = pb.png;
      await page.screenshot({ path: pb.png, fullPage: true });
      await this.imageMinService.optimize(pb.png, pb.image);
      await this.fileService.delete(pb.png);
      await page.close();

      if (await this.validateImage(pb.image)) {
        this.fileService.writeFile(pb.processed, statusFileContents);
        console.info("finished. path = " + pb.image);
      } else {
        // cleaning
        await this.fileService.delete(pb.image);
        throw new Error("detect invalid image. path = " + pb.image);
      }
    } catch (e) {
      console.error(e);

      // cleaning
      await this.fileService.delete(pngPath);

      if (retry < config.retry) {
        return await this.process(hash, retry + 1);
      }
      console.error("process failed. hash = " + hash);
      throw e;
    }
  }

  async validateImage(filePath: string) {
    const stats = await this.fileService.stat(filePath);
    if (stats && stats.size > 1024 * 7) {
      return true;
    }
    return false;
  }
}
