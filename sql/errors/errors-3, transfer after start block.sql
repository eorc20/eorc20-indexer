-- view (code=3, 'transfer after start block') --
DROP TABLE IF EXISTS errors_transfer_3_mv;
CREATE MATERIALIZED VIEW errors_transfer_3_mv TO errors_transfer AS
SELECT
    id,
    3 as code
FROM transfer
JOIN overrides ON overrides.tick == transfer.tick
WHERE
    transfer.block_number < overrides.transfer_start_block_number;

INSERT INTO errors_transfer SELECT
    id,
    3 as code
FROM transfer
JOIN overrides ON overrides.tick == transfer.tick
WHERE
    transfer.block_number < overrides.transfer_start_block_number;