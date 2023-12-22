-- TO-DO --
-- 1. filter by transaction_index on equal block_number


-- table --
DROP TABLE IF EXISTS overrides;
CREATE TABLE overrides
(
    tick                                LowCardinality(String),
    deploy_start_block_number           UInt32(),
    mint_start_block_number             UInt32(),
    mint_start_native_block_number      UInt32(),
    mint_start_transaction_index        UInt32(),
    mint_stop_block_number              UInt32(),
    mint_stop_native_block_number       UInt32(),
    mint_stop_transaction_index         UInt32(),
    mint_case_sensitive                 Bool,
    mint_per_amt                        UInt64(),
    transfer_start_block_number         UInt32(),
    transfer_case_sensitive             Bool,
)
ENGINE = ReplacingMergeTree
ORDER BY (tick);

-- insert --
INSERT INTO overrides SELECT
    'eoss',
    -- deploy --
    21443204,

    -- mint --
    21443204,
    345827395,
    30,
    21558260,
    346056938,
    221,
    true,
    10000,

    -- transfer (start same as deploy) --
    21443204,
    true
