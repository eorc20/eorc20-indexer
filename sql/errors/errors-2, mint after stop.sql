-- view (code=2, 'mint after stop block') --
DROP TABLE IF EXISTS errors_mint_2_mv;
CREATE MATERIALIZED VIEW errors_mint_2_mv TO errors_mint AS
SELECT
    id,
    2 as code
FROM mint
JOIN overrides ON overrides.tick == mint.tick
WHERE
    mint.native_block_number > overrides.mint_stop_native_block_number OR
    (mint.native_block_number == overrides.mint_stop_native_block_number AND mint.transaction_index > overrides.mint_stop_transaction_index);

INSERT INTO errors_mint SELECT
    id,
    2 as code
FROM mint
JOIN overrides ON overrides.tick == mint.tick
WHERE
    mint.native_block_number > overrides.mint_stop_native_block_number OR
    (mint.native_block_number == overrides.mint_stop_native_block_number AND mint.transaction_index > overrides.mint_stop_transaction_index);
