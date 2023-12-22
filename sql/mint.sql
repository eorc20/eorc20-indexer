-- TO-DO --
-- 1. filter by transaction_index on equal block_number


-- table --
DROP TABLE IF EXISTS mint;
CREATE TABLE mint
(
    id                          FixedString(66),
    from                        FixedString(42),
    to                          FixedString(42),
    p                           LowCardinality(String),
    op                          LowCardinality(String),
    tick                        LowCardinality(String),
    amt                         UInt64,
    lim                         UInt64,
    deploy_block_number         UInt32(),
    deploy_native_block_number  UInt32(),
    deploy_transaction_index    UInt32(),
    block_number                UInt32(),
    native_block_number         UInt32(),
    timestamp                   DateTime,
    transaction_index           UInt32()
)
ENGINE = ReplacingMergeTree
ORDER BY (id);

-- view --
DROP TABLE IF EXISTS mint_mv;
CREATE MATERIALIZED VIEW mint_mv TO mint AS
SELECT
    id,
    from,
    to,
    visitParamExtractString(data, 'p') as p,
    visitParamExtractString(data, 'op') as op,
    visitParamExtractString(data, 'tick') as tick,
    visitParamExtractString(data, 'amt') as amt,
    (SELECT lim FROM deploy WHERE deploy.tick = tick LIMIT 1) as lim,
    (SELECT block_number FROM deploy WHERE deploy.tick = tick LIMIT 1) as deploy_block_number,
    (SELECT native_block_number FROM deploy WHERE deploy.tick = tick LIMIT 1) as deploy_native_block_number,
    (SELECT transaction_index FROM deploy WHERE deploy.tick = tick LIMIT 1) as deploy_transaction_index,
    block_number,
    native_block_number,
    timestamp,
    transaction_index
FROM data_json
WHERE
    p = 'eorc20' AND
    op = 'mint' AND
    notEmpty(tick) AND
    notEmpty(amt) AND
    toInt128(amt) > 0 AND
    toInt128(amt) <= 18446744073709551615 AND
    block_number >= deploy_block_number AND
    toString(lim) == toString(amt) AND
    tick IN (SELECT tick FROM deploy WHERE deploy.tick == tick);

-- insert --
INSERT INTO mint SELECT
    id,
    from,
    to,
    visitParamExtractString(data, 'p') as p,
    visitParamExtractString(data, 'op') as op,
    visitParamExtractString(data, 'tick') as tick,
    visitParamExtractString(data, 'amt') as amt,
    (SELECT lim FROM deploy WHERE deploy.tick = tick LIMIT 1) as lim,
    (SELECT block_number FROM deploy WHERE deploy.tick = tick LIMIT 1) as deploy_block_number,
    (SELECT native_block_number FROM deploy WHERE deploy.tick = tick LIMIT 1) as deploy_native_block_number,
    (SELECT transaction_index FROM deploy WHERE deploy.tick = tick LIMIT 1) as deploy_transaction_index,
    block_number,
    native_block_number,
    timestamp,
    transaction_index
FROM data_json
WHERE
    p = 'eorc20' AND
    op = 'mint' AND
    notEmpty(tick) AND
    notEmpty(amt) AND
    toInt128(amt) > 0 AND
    toInt128(amt) <= 18446744073709551615 AND
    block_number >= deploy_block_number AND
    toString(lim) == toString(amt) AND
    tick IN (SELECT tick FROM deploy WHERE deploy.tick == tick);