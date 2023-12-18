-- Table for transactions --
CREATE TABLE IF NOT EXISTS transactions  (
    -- required --
    transaction_hash        FixedString(66),
    block_number            UInt32(),
    timestamp               DateTime,
    creator                 FixedString(42),
    from_address            FixedString(42),
    to_address              FixedString(42),
    content_uri             String,
    value                   UInt256,

    -- extras --
    native_block_number     UInt32(),
    native_block_id         FixedString(64),
    mimetype                LowCardinality(String),
    media_type              LowCardinality(String),
    mime_subtype            LowCardinality(String),
    nonce                   UInt32(),
    transaction_index       UInt32(),
    gas                     UInt32(),
    gas_price               UInt32(),
    sha                     FixedString(64),
    miner                   LowCardinality(FixedString(12)),
)
ENGINE = ReplacingMergeTree()
PRIMARY KEY (transaction_hash)
ORDER BY (transaction_hash)

-- Table for blocks --
CREATE TABLE IF NOT EXISTS native_blocks (
  native_block_id      FixedString(64),
  native_block_number  UInt32(),
  timestamp     DateTime,
  final         Boolean,
)
ENGINE = ReplacingMergeTree
PRIMARY KEY (native_block_id)
ORDER BY (native_block_id);


-- Table for inscriptions --
CREATE TABLE IF NOT EXISTS operations (
    id          FixedString(66),
    p           LowCardinality(String),
    op          LowCardinality(String),
    tick        LowCardinality(String),
    max         UInt256(),
    lim         UInt32(),
    amt         UInt256(),
)
ENGINE = ReplacingMergeTree
PRIMARY KEY (id)
ORDER BY (id);

-- Table for inscriptions --
CREATE TABLE IF NOT EXISTS operations_mint (
    id                FixedString(66),
    p                 LowCardinality(String),
    op                LowCardinality(String),
    tick              LowCardinality(String),
    amt               UInt256(),
)
ENGINE = ReplacingMergeTree
PRIMARY KEY (id)
ORDER BY (id);

-- Table for inscriptions --
CREATE TABLE IF NOT EXISTS operations_transfer (
    id                FixedString(66),
    p                 LowCardinality(String),
    op                LowCardinality(String),
    tick              LowCardinality(String),
    amt               UInt256(),
)
ENGINE = ReplacingMergeTree
PRIMARY KEY (id)
ORDER BY (id);

-- Indexes for block_number and chain --
ALTER TABLE inscriptions ADD INDEX inscriptions_block_index block TYPE minmax;
ALTER TABLE inscriptions ADD INDEX inscriptions_timestamp_index timestamp TYPE minmax;

-- MV for operations --
CREATE MATERIALIZED VIEW operations_mint TO
ENGINE = MergeTree()
ORDER BY (tick, amt)
POPULATE
AS SELECT id, p, op, tick, amt FROM operations WHERE op = 'mint';

CREATE MATERIALIZED VIEW operations_deploy
ENGINE = MergeTree()
ORDER BY (tick, max, lim)
POPULATE
AS SELECT id, p, op, tick, max, lim FROM operations WHERE op = 'deploy';

CREATE MATERIALIZED VIEW operations_transfer
ENGINE = MergeTree()
ORDER BY (tick, amt)
POPULATE
AS SELECT id, p, op, tick, amt FROM operations WHERE op = 'transfer';

-- mint operations --
CREATE MATERIALIZED VIEW operations_mint
ENGINE = MergeTree()
ORDER BY (tick, amt, block_number)
POPULATE
AS SELECT
  id,
  from_address as owner,
  from_address as from,
  to_address as to,
  block_number,
  transaction_index,
  timestamp,
  value,
  content_uri,
  p,
  op,
  tick,
  amt,
FROM operations
INNER JOIN transactions
ON operations.id = transactions.transaction_hash AND op = 'mint' AND p = 'eorc20'
ORDER BY (block_number, transaction_index);

-- transfer operations --
CREATE MATERIALIZED VIEW operations_transfer
ENGINE = MergeTree()
ORDER BY (tick, amt, block_number)
POPULATE
AS SELECT
  id,
  from_address as from,
  to_address as to,
  block_number,
  timestamp,
  value,
  content_uri,
  p,
  op,
  tick,
  amt,
FROM operations
INNER JOIN transactions
ON operations.id = transactions.transaction_hash AND op = 'transfer' AND p = 'eorc20'
ORDER BY (block_number, transaction_index);

-- deploy operations --
CREATE MATERIALIZED VIEW operations_deploy
ENGINE = MergeTree()
ORDER BY (tick, block_number)
POPULATE
AS SELECT
  id,
  from_address as creator,
  to_address as owner,
  block_number,
  timestamp,
  value,
  content_uri,
  mimetype,
  p,
  op,
  tick,
  max,
  lim,
FROM operations
INNER JOIN transactions
ON operations.id = transactions.transaction_hash AND op = 'deploy' AND p = 'eorc20'
AND id != '0x48d4a902a0327c4c59b3e8f4c6a3a614f6f9950cb61b9771d726f9fd59480e2b'
ORDER BY (block_number, transaction_index);

CREATE MATERIALIZED VIEW native_blocks
ENGINE = MergeTree()
ORDER BY (block_number)
POPULATE
AS SELECT
  last_value(native_block_id) as block_id,
  last_value(native_block_number) as block_number,
  last_value(timestamp)
FROM transactions
GROUP BY native_block_id
ORDER BY block_number DESC;

-- group token holders by ticker --
SELECT
  tick
  owner,
  sum(amt) as tokens
FROM operations_mint
WHERE tick='eoss'
GROUP BY (owner, tick)
ORDER BY tokens DESC;

-- group by supply --
SELECT
  tick,
  first_value(p) as protocol,
  first_value(operations_deploy.timestamp) as deploy_timestamp,
  last_value(block_number) as last_block_number,
  last_value(timestamp) as last_timestamp,
  count(owner) as holders,
  sum(amt) as active_supply,
  first_value(max) as max_supply,
  (sum(amt) / first_value(max)) as progress,
  count(*) as transactions
FROM operations_mint
INNER JOIN operations_deploy
ON operations_deploy.tick = operations_mint.tick
GROUP BY tick
