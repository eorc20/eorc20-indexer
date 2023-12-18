CREATE MATERIALIZED VIEW data_deploy
ENGINE = ReplacingMergeTree()
ORDER BY (id)
POPULATE
AS SELECT
    id,
    visitParamExtractString(data, 'p')  as p,
    visitParamExtractString(data, 'op')  as op,
    visitParamExtractString(data, 'tick')  as tick,
    visitParamExtractString(data, 'max') as max,
    visitParamExtractString(data, 'lim') as lim
FROM data_json
WHERE
    p = 'eorc20' AND
    op = 'deploy' AND
    notEmpty(tick) AND
    notEmpty(max) AND
    toUInt64(max) > 0 AND
    notEmpty(lim) AND
    toUInt64(lim) > 0;