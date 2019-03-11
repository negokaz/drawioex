# drawioex

[![npm version](https://badge.fury.io/js/drawioex.svg)](https://badge.fury.io/js/drawioex)

A Command line tool to export images from [draw.io](https://www.draw.io/) documents.

This software includes the works of [draw.io](https://github.com/jgraph/drawio) distributed under the [Apache 2.0 license](drawio/LICENSE).

## Supported formats

- SVG
- PNG

## Install

```
npm install -g drawioex
```

## Usage

```
drawioex -f svg -o ./target ./source/diagram.xml
```

Multiple input files:

```
drawioex -f svg -o ./target ./source/*.xml
```

## Licence

Copyright (c) 2019 Kazuki Negoro

drawioex is released under the [MIT License](./LICENSE)