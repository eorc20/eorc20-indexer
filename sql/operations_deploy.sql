CREATE MATERIALIZED VIEW operations_deploy
ENGINE = ReplacingMergeTree()
ORDER BY (id)
POPULATE
AS SELECT * FROM operations
JOIN transactions ON operations.id = transactions.transaction_hash
    AND op = 'deploy'
    AND p = 'eorc20'
    AND id != '0x48d4a902a0327c4c59b3e8f4c6a3a614f6f9950cb61b9771d726f9fd59480e2b';