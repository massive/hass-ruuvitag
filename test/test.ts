import { calculateAcceleration } from "../lib/calc";

import { getAppConfig } from "../lib/config";
import Manager from "../lib/Manager";
import {Tag, TagConfig} from "../lib/types";

import mqtt, {Client, MqttClient} from 'mqtt';
import { mock } from 'jest-mock-extended';
import {createMetrics, updateTagState} from "../lib/hass-interface";
import logger from "../lib/logger"

jest.mock("mqtt");
jest.mock("../lib/logger");

const data = {
  dataFormat: 3,
  rssi: -56,
  humidity: 23.5,
  temperature: 21.99,
  pressure: 100912,
  accelerationX: -280,
  accelerationY: -956,
  accelerationZ: 36,
  battery: 2965,
  ts: 1545422440544,
};
calculateAcceleration(data);

const tag: Tag = {
  id: "f00f00f00",
  on() {
    return;
  },
};

function getTagConfig(attrs: Partial<TagConfig>): TagConfig {
  const base = {
    id: tag.id,
    name: "somename",
    enabled: true,
    temperature: false,
    pressure: false,
    humidity: false,
    battery: false,
    acceleration: false,
    accelerationX: false,
    accelerationY: false,
    accelerationZ: false,
  };

  return { ...base, ...attrs };
}
describe("Manager", () => {

  it("informs the user about unconfigured tags", () => {
    const manager = new Manager(getAppConfig(), mock<MqttClient>());
    const logSpy = jest.spyOn(logger, "info").mockImplementation();
    manager.handleRuuviUpdate(tag, data);
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy.mock.calls[0][0]).toMatch(`unconfigured tag ${tag.id}`);
    logSpy.mockRestore();
  });

  it("sends discovery messages", () => {
    const appConfig = getAppConfig();
    const tagConfig = getTagConfig({
      temperature: true,
      pressure: true,
    });

    appConfig.tags.push(tagConfig);

    const mockClient = mock<MqttClient>();
    createMetrics(mockClient, appConfig, tagConfig);

    expect(mockClient.publish).toHaveBeenCalledTimes(2)
    expect(mockClient.publish).toHaveBeenNthCalledWith(1,"homeassistant/sensor/f00f00f00/temperature/config", JSON.stringify({ "unit_of_measurement": '°C', "device_class": "temperature" }))
    expect(mockClient.publish).toHaveBeenNthCalledWith(2,"homeassistant/sensor/f00f00f00/pressure/config", JSON.stringify({ "unit_of_measurement": 'hPa', "device_class": "pressure" }))
  });

  it("updates tag state", () => {
    const appConfig = getAppConfig();
    const tagConfig = getTagConfig({
      temperature: true,
      pressure: true,
    });

    const mockClient = mock<MqttClient>();
    appConfig.tags.push(tagConfig);

    updateTagState(mockClient, appConfig, tagConfig, data);

    expect(mockClient.publish).toHaveBeenCalledTimes(1)
    expect(mockClient.publish).toHaveBeenNthCalledWith(1,"homeassistant/sensor/f00f00f00", JSON.stringify(data))
  });

  it("Manager creates discovery messages and updates tag state", () => {
    const appConfig = getAppConfig();
    appConfig.debug = true;
    const tagConfig = getTagConfig({
      temperature: true
    });

    const mockClient = mock<MqttClient>();

    const manager = new Manager(appConfig, mockClient);
    appConfig.tags.push(tagConfig);
    manager.handleRuuviUpdate(tag, data);

    expect(mockClient.publish).toHaveBeenCalledTimes(2)
    expect(mockClient.publish).toHaveBeenNthCalledWith(1,"homeassistant/sensor/f00f00f00/temperature/config", JSON.stringify({ "unit_of_measurement": '°C', "device_class": "temperature" }))
    expect(mockClient.publish).toHaveBeenNthCalledWith(2,"homeassistant/sensor/f00f00f00", JSON.stringify(data))
  });

  it("does nothing for disabled tags", () => {
    const appConfig = getAppConfig();
    const tagConfig = getTagConfig({
      enabled: false
    });

    const mockClient = mock<MqttClient>();

    const manager = new Manager(appConfig, mockClient);
    appConfig.tags.push(tagConfig);
    manager.handleRuuviUpdate(tag, data);

    expect(mockClient.publish).toHaveBeenCalledTimes(0);
  });
});
