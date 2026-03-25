#!/bin/bash

# Function to check if a command exists
check_command() {
    command -v "$1" >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "$1 is not installed!"
        case $1 in
            "go")
                echo "Please install Go, https://go.dev/doc/install."
                ;;
            "oapi-codegen")
                echo "Run 'go get github.com/oapi-codegen/oapi-codegen/v2' to install oapi-codegen."
                ;;
            "npm")
                echo "Please install NodeJS and npm, https://docs.npmjs.com/downloading-and-installing-node-js-and-npm."
                ;;
            "npx")
                echo "Run 'npm install -g npx' to install npx."
                ;;
            *)
                echo "Unknown command $1. Please install it manually."
                ;;
        esac
        exit 1
    else
        echo "$1 is already installed."
    fi
}

echo "Checking For Required Tools..."
echo -n "   "
check_command go
echo -n "   "
check_command oapi-codegen
echo -n "   "
check_command npm
echo -n "   "
check_command npx


VERSIONS=("v1")

for VERSION in "${VERSIONS[@]}"; do
    echo "Generating API for $VERSION..."

    # Go server generation
    echo "Generating Backend $VERSION Server API..."
    touch ./internal/api/$VERSION/sector.gen.go
    oapi-codegen --config=models/$VERSION/config.yaml models/$VERSION/schema.yaml

    # TypeScript client generation
    echo "Generating Frontend $VERSION Types..."
    npx openapi-typescript models/$VERSION/schema.yaml -o ./frontend/src/types/$VERSION/api.gen.ts

    echo "$VERSION generation complete!"
done
