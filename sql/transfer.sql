CREATE MATERIALIZED VIEW transfer
ENGINE = ReplacingMergeTree()
ORDER BY (id)
POPULATE
AS SELECT * FROM data_transfer
JOIN transactions ON data_transfer.id = transactions.transaction_hash;