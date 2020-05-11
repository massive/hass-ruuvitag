import {calculateAcceleration} from "./calc";
import {createMetrics, updateTagState} from "./hass-interface";
import {presentUnconfiguredTag} from "./help";
import {AppConfig, Tag, TagConfigState, TagData} from "./types";
import {Client} from 'mqtt'

export default class Manager {
  private lastUpdateTimestamps: { [id: string]: number } = {};
  private tagDatas: { [id: string]: TagData } = {};
  private readonly appConfig: AppConfig;
  private readonly mqttClient: Client;
  private initialized: { [id: string]: boolean } = {};

  constructor(appConfig: AppConfig, mqttClient: Client) {
    this.appConfig = appConfig;
    this.mqttClient = mqttClient;
  }

  public handleRuuviUpdate = (tag: Tag, data: TagData) => {
    let tagConfigState: TagConfigState = TagConfigState.UNKNOWN;
    const tagConfig = this.appConfig.tags.find(c => c.id === tag.id);

    if (tagConfig) tagConfigState = tagConfig.enabled ? TagConfigState.ENABLED : TagConfigState.DISABLED;

    if (tagConfigState === TagConfigState.DISABLED) {
      return;
    }

    if (!tagConfig) {
      presentUnconfiguredTag(tag, data);
      this.initialized[tag.id] = true;
      return;
    }

    if (!this.initialized[tag.id]) {
      createMetrics(this.mqttClient, this.appConfig, tagConfig);
      this.initialized[tag.id] = true;
    }

    const timestamp = +new Date();
    calculateAcceleration(data);

    this.tagDatas[tag.id] = { ...data, timestamp };

    const lastUpdateTs = this.lastUpdateTimestamps[tag.id] || 0;
    const interval = (tagConfig.interval || 0 || this.appConfig.interval) * 1000;

    if (interval > 0 && timestamp - lastUpdateTs >= interval) {
      this.lastUpdateTimestamps[tag.id] = timestamp;
      updateTagState(this.mqttClient, this.appConfig, tagConfig, data);
    }
  };
}
