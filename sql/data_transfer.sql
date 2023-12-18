CREATE MATERIALIZED VIEW data_transfer
ENGINE = ReplacingMergeTree()
ORDER BY (id)
POPULATE
AS SELECT
    id,
    toLowCardinality(visitParamExtractString(data, 'p')) as p,
    toLowCardinality(visitParamExtractString(data, 'op')) as op,
    toLowCardinality(visitParamExtractString(data, 'tick')) as tick,
    visitParamExtractString(data, 'amt') as amt
FROM data_json
WHERE
    p = 'eorc20' AND
    op = 'transfer' AND
    notEmpty(tick) AND
    notEmpty(amt) AND
    toInt128(amt) > 0;