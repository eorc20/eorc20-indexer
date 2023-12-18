CREATE MATERIALIZED VIEW deploy
ENGINE = ReplacingMergeTree()
ORDER BY (id)
POPULATE
AS SELECT * FROM data_deploy
JOIN transactions ON data_deploy.id = transactions.transaction_hash
    AND id != '0x48d4a902a0327c4c59b3e8f4c6a3a614f6f9950cb61b9771d726f9fd59480e2b';