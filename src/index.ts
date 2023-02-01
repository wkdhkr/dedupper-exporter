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

    // this.imageExtractionService.init().then((t) => t.extractImages(hashes));
    await this.imageExtractionService.init().then(async (t) => {
      // await t.extractImages(hashes.slice(0, 50));
      await t.extractImages(hashes);
      /*
      await t.extractImages([
        "02ba260fbb200f4c105e56de4be911ea529b6d173b7581d3a6dc15adef75d281",
      ]);
      */
      await t.close();
    });

    console.info("finished.");
  }
}

const app = new App();

app.exec();
