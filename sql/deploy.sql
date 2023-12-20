-- table --
CREATE TABLE deploy
(
    id                      FixedString(66),
    from                    FixedString(42),
    to                      FixedString(42),
    p                       LowCardinality(String),
    op                      LowCardinality(String),
    tick                    LowCardinality(String),
    max                     UInt64,
    lim                     UInt64,
    block_number            UInt32(),
    timestamp               DateTime,
    transaction_index       UInt32()
)
ENGINE = ReplacingMergeTree
ORDER BY (id);

-- view --
CREATE MATERIALIZED VIEW deploy_mv TO deploy AS
SELECT
    id,
    from,
    to,
    visitParamExtractString(data, 'p') as p,
    visitParamExtractString(data, 'op') as op,
    visitParamExtractString(data, 'tick') as tick,
    visitParamExtractString(data, 'max') as max,
    visitParamExtractString(data, 'lim') as lim,
    block_number,
    timestamp,
    transaction_index
FROM data_json
WHERE
    p = 'eorc20' AND
    op = 'deploy' AND
    notEmpty(tick) AND
    notEmpty(max) AND
    toInt128(max) > 0 AND
    notEmpty(lim) AND
    toInt128(lim) > 0 AND
    id != '0x48d4a902a0327c4c59b3e8f4c6a3a614f6f9950cb61b9771d726f9fd59480e2b';

