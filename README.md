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
EOS_START_BLOCK=345827395
```

### API requirement

- chain state
  - last EOS EVM block
  - total EORC-20 inscriptions
- Token Holdings
  - POST `/balance`
    - address
    - limit
    - offset
  - POST `/balance/history`
    - address
    - limit
    - offset
    - tick
- mimetype
  - application/json
  - text/plain
- content URI
  - sha256

### Indexing rules

#### `mint`

- `to` should be defined as null address `0x0000000000000000000000000000000000000000`
- `from` is the `owner` of the `EORC-20` token
- `amt` should match exactly `lim` of the `EORC-20` token according to `deploy` operation
  - must be a positive `BigInt`