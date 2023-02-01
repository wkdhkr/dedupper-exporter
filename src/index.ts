import "reflect-metadata";

import { autoInjectable } from "tsyringe";
import HashCollectionService from "./services/HashCollectionService.js";
import ImageExtractionService from "./services/ImageExtractionService.js";

@autoInjectable()
class App {
  constructor(
    private hashCollectionService?: HashCollectionService,
    private imageExtractionService?: ImageExtractionService,
  ) {
  }

  async exec() {
    const hashes = await this.hashCollectionService.collectHashesFromDb();
    console.info("hit_count = " + hashes.length);

    await this.imageExtractionService.init().then(async (t) => {
      await t.extractImages(hashes);
      await t.close();
    });

    console.info("finished.");
  }
}

const app = new App();

app.exec();
