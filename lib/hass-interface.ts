import {AppConfig, MetricOptions, SubscribableData, TagConfig, TagData, TagDefinition, TopicType} from "./types";
import {Client} from 'mqtt'
import logger from "./logger"

type MetricName = keyof SubscribableData | "";

function topicFor(id: string, metric: MetricName = "", type: TopicType = TopicType.DEFAULT) {
  return ["homeassistant", "sensor", id, metric, type].filter(v => v.length > 0).join("/")
}

function createMetricDefinition(options: MetricOptions, tagConfig: TagConfig): TagDefinition {
  const attributes: TagDefinition = {};

  if (options.unit) {
    attributes.unit_of_measurement = options.unit;
  }
  if (options.deviceClass) {
    attributes.device_class = options.deviceClass;
  }

  return attributes;
}

export function createMetrics(mqttClient: Client, appConfig: AppConfig, tagConfig: TagConfig) {

  const metricMap: MetricOptions[] = [
      { name: "temperature", unit: "°C", deviceClass: "temperature" },
      { name: "pressure", unit: "hPa", deviceClass: "pressure", scalingFactor: 1 / 100 },
      { name: "humidity", unit: "%", deviceClass: "humidity" },
      { name: "battery", unit: "mV" },
      { name: "acceleration", unit: "mG" },
      { name: "accelerationX", unit: "mG" },
      { name: "accelerationY", unit: "mG" },
      { name: "accelerationZ", unit: "mG" },
  ];

  metricMap.forEach(metric => {
    if (!tagConfig[metric.name]) return;

    const attributes = createMetricDefinition(metric, tagConfig);
    const topic = topicFor(tagConfig.id, metric.name, TopicType.CONFIG);
    mqttClient.publish(topic, JSON.stringify(attributes));
    if (appConfig.debug) {
        logger.debug(topic);
        logger.debug(attributes)
    }
  })
}

export function updateTagState(mqttClient: Client, config: AppConfig, tagConfig: TagConfig, data: TagData) {
  if (config.debug) {
    logger.debug(data);
  }

  const topic = topicFor(tagConfig.id);
  mqttClient.publish(topic, JSON.stringify(data));
}
