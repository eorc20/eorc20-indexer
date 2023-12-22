-- view (code=2, 'mint after stop block') --
DROP TABLE IF EXISTS errors_2_mv;
CREATE MATERIALIZED VIEW errors_2_mv TO errors AS
SELECT
    id,
    op,
    2 as code
FROM mint
JOIN overrides ON overrides.tick == mint.tick
WHERE
    mint.native_block_number > overrides.mint_stop_native_block_number OR
    (mint.native_block_number == overrides.mint_stop_native_block_number AND mint.transaction_index > overrides.mint_stop_transaction_index);

INSERT INTO errors SELECT
    id,
    op,
    2 as code
FROM mint
JOIN overrides ON overrides.tick == mint.tick
WHERE
    mint.native_block_number > overrides.mint_stop_native_block_number OR
    (mint.native_block_number == overrides.mint_stop_native_block_number AND mint.transaction_index > overrides.mint_stop_transaction_index);
