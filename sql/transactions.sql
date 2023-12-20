-- Table for transactions --
CREATE TABLE IF NOT EXISTS transactions  (
    -- required --
    transaction_hash        FixedString(66),
    block_number            UInt32(),
    timestamp               DateTime,
    transaction_index       UInt32(),
    from_address            FixedString(42),
    to_address              FixedString(42),
    creator                 FixedString(42),
    content_uri             String,
    value                   UInt256,

    -- extras --
    native_block_number     UInt32(),
    native_block_id         FixedString(64),
    mimetype                LowCardinality(String),
    media_type              LowCardinality(String),
    mime_subtype            LowCardinality(String),
    nonce                   UInt32(),
    gas                     UInt32(),
    gas_price               UInt32(),
    sha                     FixedString(64),
    miner                   LowCardinality(FixedString(12)),
)
ENGINE = ReplacingMergeTree()
PRIMARY KEY (transaction_hash)
ORDER BY (transaction_hash)