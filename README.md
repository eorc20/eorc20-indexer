# `EORC-20` Indexer

> Allows to index `EORC-20` inscription operations from EOS EVM blocks.

## Install

```bash
$ gh repo clone pinax-network/eorc20-indexer
$ cd eorc20-indexer
$ npm install
```

## Usage

```bash
$ npm start
```

### Requirements

- [Clickhouse DB](https://clickhouse.com/)
- Substreams API Key from https://app.pinax.network

**.env**

```env
# Get API key @ app.pinax.network
SUBSTREAMS_API_TOKEN="<API KEY>"

# Clickhouse DB
USERNAME=default
PASSWORD=''
HOST=http://localhost:8123

# Indexer settings
START_BLOCK=349099829
CURSOR_FILENAME=cursor.lock
PAUSED=false
SAVE_ON_DISK=false
SAVE_ON_DATABASE=true
FINAL_BLOCKS_ONLY=false
```
