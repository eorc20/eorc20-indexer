-- view (code=1, 'mint before start block') --
DROP TABLE IF EXISTS errors_1_mv;
CREATE MATERIALIZED VIEW errors_1_mv TO errors AS
SELECT
    op,
    id,
    1 as code
FROM mint
JOIN overrides ON overrides.tick == mint.tick
WHERE
    mint.native_block_number < overrides.mint_start_native_block_number OR
    (mint.native_block_number = overrides.mint_start_native_block_number AND mint.transaction_index < overrides.mint_start_transaction_index);

INSERT INTO errors SELECT
    op,
    id,
    1 as code
FROM mint
JOIN overrides ON overrides.tick == mint.tick
WHERE
    mint.native_block_number < overrides.mint_start_native_block_number OR
    (mint.native_block_number = overrides.mint_start_native_block_number AND mint.transaction_index < overrides.mint_start_transaction_index);