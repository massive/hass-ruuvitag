#!/usr/bin/env bashio

set -e

CONFIG_PATH=/config

MQTT_CLIENT_ID="$(bashio::config 'mqtt_client_id')"
MQTT_HOST=$(bashio::services mqtt "host")
MQTT_PORT=$(bashio::services mqtt "port")
MQTT_USER=$(bashio::services mqtt "username")
MQTT_PASSWORD=$(bashio::services mqtt "password")


if [ "$VERBOSE" = "true" ]; then
    set -- "$@" --verbose
fi

bashio::log.info "Starting $(xcomfortd --version)"
bashio::log.debug "$(echo $@ | sed s/${MQTT_USER}:${MQTT_PASSWORD}/*****/g)"

exec "$@"