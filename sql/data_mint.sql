CREATE MATERIALIZED VIEW data_mint
ENGINE = ReplacingMergeTree()
ORDER BY (id)
POPULATE
AS SELECT
    id,
    visitParamExtractString(data, 'p')  as p,
    visitParamExtractString(data, 'op')  as op,
    visitParamExtractString(data, 'tick')  as tick,
    visitParamExtractString(data, 'amt') as amt
FROM data_json
WHERE
    p = 'eorc20' AND
    op = 'mint' AND
    notEmpty(tick) AND
    notEmpty(amt) AND
    toUInt64(amt) > 0;