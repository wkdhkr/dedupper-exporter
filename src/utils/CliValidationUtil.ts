import * as commander from "commander";

export default class CliValidationUtil {
  static parseInt(value: any) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      throw new commander.InvalidArgumentError("Not a number.");
    }
    return parsedValue;
  }
}
