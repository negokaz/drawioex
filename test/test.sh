#!/bin/bash -xe

function setup {
    cd "$(dirname $0)"
}

function teardown {
    :
}

function test {

    # export SVG
    drawioex -f svg --output result/svg source/simple.drawio
    # export SVG with --embed-images option
    drawioex -f svg --output result/svg --embed-images source/include-external-image.drawio

    # export PNG
    drawioex -f png --output result/png source/simple.drawio
}

function drawioex {
    node ../app.js "$@"
}

setup $@
trap 'teardown' EXIT
test