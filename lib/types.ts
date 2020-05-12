export interface TagConfig {
  id: string;
  name: string;
  enabled: boolean;
  temperature: boolean;
  pressure: boolean;
  humidity: boolean;
  battery: boolean;
  acceleration: boolean;
  accelerationX: boolean;
  accelerationY: boolean;
  accelerationZ: boolean;
  interval?: number;
}

export interface TagData {
  timestamp?: number;
  dataFormat?: number;
  rssi?: number;
  humidity: number;
  temperature: number;
  pressure: number;
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  acceleration?: number; // computed by ourselves
  battery: number;
}

export type SubscribableData = TagConfig | TagData

export interface AppConfig {
  interval: number;
  debug: boolean;
  tags: TagConfig[];
  mqtt: {
    host: string | undefined;
    port: number;
    user?: string
    password?: string;
  }
}

export interface Tag {
  id: string;
  on: (event: string, handler: (data: TagData) => void) => void;
}

export type TagDefinition = { [key: string]: any };

export enum TopicType {
  DEFAULT = "",
  CONFIG = "config"
}

export enum TagConfigState {
  UNKNOWN,
  DISABLED,
  ENABLED
}

export interface MetricOptions {
  name: keyof SubscribableData
  unit: string,
  deviceClass?: string,
  scalingFactor?: number
}
