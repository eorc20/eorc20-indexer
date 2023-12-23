-- view (code=3, 'transfer after start block') --
DROP TABLE IF EXISTS errors_3_mv;
CREATE MATERIALIZED VIEW errors_3_mv TO errors AS
SELECT
    op,
    id,
    3 as code
FROM transfer
JOIN overrides ON overrides.tick == transfer.tick
WHERE
    transfer.block_number < overrides.transfer_start_block_number;

INSERT INTO errors SELECT
    op,
    id,
    3 as code
FROM transfer
JOIN overrides ON overrides.tick == transfer.tick
WHERE
    transfer.block_number < overrides.transfer_start_block_number;