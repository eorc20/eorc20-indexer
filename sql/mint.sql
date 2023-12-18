CREATE MATERIALIZED VIEW mint
ENGINE = ReplacingMergeTree()
ORDER BY (id)
POPULATE
AS SELECT * FROM data_mint
JOIN transactions ON data_mint.id = transactions.transaction_hash;