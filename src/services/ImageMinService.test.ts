import path from "path";
import { describe, expect, it } from "vitest";
import os from "os";
import config from "../config.js";
import Subject from "./ImageMinService.js";
import { rm, stat } from "fs/promises";

describe(Subject.name, () => {
  it("optimize WebP", async () => {
    config.extension = "webp";
    const subject = new Subject();
    const from = path.resolve("sample/firefox.png");
    const to = path.join(os.tmpdir(), "firefox.webp");
    await subject.optimize(from, to);

    const stats = await stat(to);
    expect(stats.isFile()).toBeTruthy();
    expect(stats.size).greaterThan(10 * 1024);
    await rm(to);
  });

  it("optimize JPEG(guetzli)", async () => {
    config.extension = "jpg";
    config.jpgEncoder = "guetzli";
    config.qualityForJpg = 84;
    const subject = new Subject();
    const from = path.resolve("sample/firefox.png");
    const to = path.join(os.tmpdir(), "firefox.jpg");
    await subject.optimize(from, to);

    const stats = await stat(to);
    expect(stats.isFile()).toBeTruthy();
    expect(stats.size).greaterThan(10 * 1024);
    await rm(to);
  }, 1000 * 10);

  // https://github.com/vitest-dev/vitest/pull/2772
  it.skip("optimize JPEG(mozjpeg)", async () => {
    config.extension = "jpg";
    config.jpgEncoder = "mozjpeg";
    const subject = new Subject();
    const from = path.resolve("sample/firefox.png");
    const to = path.posix.join(os.tmpdir(), "firefox.jpg");
    await subject.optimize(from, to);

    /*
    const stats = await stat(to);
    expect(stats.isFile()).toBeTruthy();
    expect(stats.size).greaterThan(10 * 1024);
    await rm(to);
    */
  });
});
