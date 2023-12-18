CREATE MATERIALIZED VIEW operations_transfer
ENGINE = ReplacingMergeTree()
ORDER BY (id)
POPULATE
AS SELECT * FROM operations
JOIN transactions ON operations.id = transactions.transaction_hash
    AND op = 'transfer'
    AND p = 'eorc20';