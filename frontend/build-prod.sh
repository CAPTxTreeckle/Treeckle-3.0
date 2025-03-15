#!/usr/bin/env bash

env_file=".env.production"

# Read env_file and set build args
# build_args=""
# while IFS= read -r line; do
#     if [[ $line =~ ^\s*# ]] || [[ $line =~ ^\s*$ ]]; then
#         continue
#     fi

#     key=$(echo "$line" | cut -d= -f1)
#     value=$(echo "$line" | cut -d= -f2-)

#     build_args+="--build-arg $key=$value "
# done < $env_file

# echo $build_args

sudo docker build . -t jermytan/treeckle-frontend:production --build-arg MODE=production --build-arg ENV_FILE=$env_file # $build_args
