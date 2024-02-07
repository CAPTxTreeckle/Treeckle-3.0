#!/usr/bin/env bash

env_file=".env.beta"

build_args=""
while IFS= read -r line; do
    if [[ $line =~ ^\s*# ]] || [[ $line =~ ^\s*$ ]]; then
        continue
    fi

    key=$(echo "$line" | cut -d= -f1)
    value=$(echo "$line" | cut -d= -f2-)

    build_args+="--build-arg $key=$value "
done < $env_file

echo $build_args

sudo docker build . -t jermytan/treeckle-frontend $build_args
