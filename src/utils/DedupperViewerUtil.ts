import config from "../config.js";

export default class DedupperViewerUtil {
  static createMainViewerUrl(hash: string) {
    return [
      `${config.protocol}://${config.host}:${config.port}/image/${hash}`,
      `?mode=subviewer&o=${config.orientation}&parentHost=${config.host}&render=1`,
    ].join("");
  }
}
