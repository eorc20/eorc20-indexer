-- table --
CREATE TABLE transfer
(
    id                      FixedString(66),
    from                    FixedString(42),
    to                      FixedString(42),
    p                       LowCardinality(String),
    op                      LowCardinality(String),
    tick                    LowCardinality(String),
    amt                     UInt64,
    block_number            UInt32(),
    timestamp               DateTime,
    transaction_index       UInt32()
)
ENGINE = ReplacingMergeTree
ORDER BY (id);

-- view --
CREATE MATERIALIZED VIEW transfer_mv TO transfer AS
SELECT
    id,
    from,
    to,
    visitParamExtractString(data, 'p') as p,
    visitParamExtractString(data, 'op') as op,
    visitParamExtractString(data, 'tick') as tick,
    visitParamExtractString(data, 'amt') as amt,
    block_number,
    timestamp,
    transaction_index,
FROM data_json
WHERE
    p = 'eorc20' AND
    op = 'transfer' AND
    notEmpty(tick) AND
    notEmpty(amt) AND
    toInt128(amt) > 0;
