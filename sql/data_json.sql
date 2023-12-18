CREATE MATERIALIZED VIEW data_json
ENGINE = ReplacingMergeTree()
ORDER BY (id)
POPULATE
AS SELECT
    transaction_hash as id,
    replaceRegexpOne(content_uri, 'data:(application/json)?,', '') as data,
    mimetype
FROM transactions
WHERE
    isValidJSON(data);