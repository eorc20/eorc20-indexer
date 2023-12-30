-- table --
DROP TABLE IF EXISTS list;
CREATE TABLE list
(
    id                      FixedString(66),
    from                    FixedString(42),
    to                      FixedString(42),
    p                       LowCardinality(String),
    op                      LowCardinality(String),
    tick                    LowCardinality(String),
    amt                     Int128,
    block_number            UInt32(),
    native_block_number     UInt32(),
    native_block_id         FixedString(64),
    timestamp               DateTime,
    transaction_index       UInt32()
)
ENGINE = ReplacingMergeTree
ORDER BY (id);

-- view --
DROP TABLE IF EXISTS list_mv;
CREATE MATERIALIZED VIEW list_mv TO list AS
SELECT
    id,
    from,
    to,
    visitParamExtractString(data, 'p') as p,
    visitParamExtractString(data, 'op') as op,
    visitParamExtractString(data, 'tick') as tick,
    visitParamExtractString(data, 'amt') as amt,
    block_number,
    native_block_number,
    native_block_id,
    timestamp,
    transaction_index
FROM data_json
WHERE
    p = 'eorc20' AND
    op = 'list' AND
    notEmpty(tick) AND
    notEmpty(amt) AND
    toInt128(amt) > 0 AND
    toInt128(amt) <= 18446744073709551615;

-- insert --
INSERT INTO list SELECT
    id,
    from,
    to,
    visitParamExtractString(data, 'p') as p,
    visitParamExtractString(data, 'op') as op,
    visitParamExtractString(data, 'tick') as tick,
    visitParamExtractString(data, 'amt') as amt,
    block_number,
    native_block_number,
    native_block_id,
    timestamp,
    transaction_index
FROM data_json
WHERE
    p = 'eorc20' AND
    op = 'list' AND
    notEmpty(tick) AND
    notEmpty(amt) AND
    toInt128(amt) > 0 AND
    toInt128(amt) <= 18446744073709551615