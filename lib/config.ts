import { AppConfig } from "./types";
import logger from "./logger"

export function getAppConfig(): AppConfig {
  const config = {
    interval: 30,
    debug: false,
    tags: [],
    mqtt: {
      host: process.env.MQTT_HOST || "mqtt://core-mosquitto",
      port: process.env.MQTT_PORT || '1883',
      user: process.env.MQTT_USER,
      password: process.env.MQTT_PASSWORD
    }
  };

  logger.debug(config);
  return config;
}

export function readConfig(path?: string): AppConfig {
  const config = getAppConfig();
  if (path) {
    try {
      Object.assign(config, require(path));
    } catch (e) {
      logger.warn("Unable to read config: " + e);
    }
  }
  return config;
}
