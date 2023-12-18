CREATE MATERIALIZED VIEW data_deploy
ENGINE = ReplacingMergeTree()
ORDER BY (id)
POPULATE
AS SELECT
    id,
    toLowCardinality(visitParamExtractString(data, 'p'))  as p,
    toLowCardinality(visitParamExtractString(data, 'op'))  as op,
    toLowCardinality(visitParamExtractString(data, 'tick'))  as tick,
    visitParamExtractString(data, 'max') as max,
    visitParamExtractString(data, 'lim') as lim
FROM data_json
WHERE
    p = 'eorc20' AND
    op = 'deploy' AND
    notEmpty(tick) AND
    notEmpty(max) AND
    toInt128(max) > 0 AND
    notEmpty(lim) AND
    toInt128(lim) > 0;