CREATE MATERIALIZED VIEW native_blocks
ENGINE = MergeTree()
ORDER BY (block_number)
POPULATE
AS SELECT
  last_value(native_block_id) as block_id,
  last_value(native_block_number) as block_number,
  last_value(timestamp) as timestamp
FROM transactions
GROUP BY native_block_id;