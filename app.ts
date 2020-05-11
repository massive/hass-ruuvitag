// @ts-ignore
import ruuvidriver from "ruuvidriver";
import packageInfo from "./package.json";
import mqtt from 'mqtt';

import { readConfig } from "./lib/config";
import Manager from "./lib/Manager";
import { Tag, TagData } from "./lib/types";
import logger from "./lib/logger";

logger.info(`This is ${packageInfo.name} ${packageInfo.version}, terrrrrrrve`);

const config = readConfig(process.env.OPTIONS_JSON_PATH || "/data/options.json");
if (!config.mqtt.host || config.mqtt.host === "") {
  logger.warn("AppConfig: no host given, will probably not be able to update data");
}

ruuvidriver.init();

const ruuvi = ruuvidriver.getRuuvi();
ruuvi.on("found", (tag: Tag) => {
  tag.on("updated", (data: TagData) => manager.handleRuuviUpdate(tag, data));
});

const client = mqtt.connect(config.mqtt.host, {
  port: parseInt(config.mqtt.port, 10)
});

client.on('error', (e) => logger.error(e.toString()));
client.on('offline', () => logger.warn("Gone offline"));
client.on('reconnect', () => logger.warn("Reconnected"));

const manager = new Manager(config, client);

