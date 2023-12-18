CREATE MATERIALIZED VIEW operations_mint
ENGINE = ReplacingMergeTree()
ORDER BY (id)
POPULATE
AS SELECT * FROM operations
JOIN transactions ON operations.id = transactions.transaction_hash
    AND op = 'mint'
    AND p = 'eorc20';