# `EORC-20` Indexer

> Allows to index `EORC-20` inscription operations from EOS EVM blocks.

## Install

```bash
$ npm -g install eorc20
```

## Usage

```bash
$ eorc20 --eos-start-block 345827395 --ticker eoss
```

Outputs the following JSONL files to disk:
- `eorc20.jsonl` (EORC-20 operations)
- `blocks.jsonl` (EOS EVM blocks)

### Get API key

- https://app.pinax.network/

**.env**
```env
# Get API key @ app.pinax.network
SUBSTREAMS_API_TOKEN="<API KEY>"
TICKERS="eoss"
EOS_START_BLOCK=345827395
```
