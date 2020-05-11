import { Tag, TagConfig, TagData } from "./types";
import logger from "./logger"

export function presentUnconfiguredTag(tag: Tag, data: TagData) {
  const exampleConfig: TagConfig = {
    id: tag.id,
    name: "some-name",
    enabled: true,
    temperature: true,
    pressure: true,
    humidity: true,
    battery: true,
    acceleration: false,
    accelerationX: false,
    accelerationY: false,
    accelerationZ: false,
  };
  logger.info(`Found an unconfigured tag ${tag.id}. This will only be shown once per tag.`);
  logger.info(`To help you identify this tag, its current information follows.`);
  logger.info(data);
  logger.info(`To have its status posted to Home Assistant, add the following to the tags configuration:`);
  logger.info(exampleConfig);
}
