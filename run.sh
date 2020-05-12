#!/usr/bin/env bashio
MQTT_CONFIG=$(bashio::services 'mqtt')
if bashio::var.has_value "${MQTT_CONFIG}"; then
    bashio::log.info "Setting up Home Assistant configuration"
    echo "${MQTT_CONFIG}" | jq '{homeAssistant: {mqttUrl: "mqtt://\(.host):\(.port)", mqttOptions: {username: .username, password: .password}}}' > /app/default.json
fi

bashio::log.info "Starting RuuviTag"

exec node app.js