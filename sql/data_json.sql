-- table --
CREATE TABLE data_json
(
    id                      FixedString(66),
    from                    FixedString(42),
    to                      FixedString(42),
    data                    String,
    mimetype                LowCardinality(String),
    block_number            UInt32(),
    timestamp               DateTime,
    transaction_index       UInt32(),
)
ENGINE = ReplacingMergeTree
ORDER BY (id);

-- view --
CREATE MATERIALIZED VIEW data_json_mv TO data_json AS
SELECT
    transaction_hash as id,
    from_address as from,
    to_address as to,
    replaceRegexpOne(content_uri, 'data:(application/json)?,', '') as data,
    mimetype,
    block_number,
    timestamp,
    transaction_index,
FROM transactions;

-- insert --
INSERT INTO data_json SELECT
    transaction_hash as id,
    from_address as from,
    to_address as to,
    replaceRegexpOne(content_uri, 'data:(application/json)?,', '') as data,
    mimetype,
    block_number,
    timestamp,
    transaction_index,
FROM transactions;
