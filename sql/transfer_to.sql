-- view --
DROP TABLE IF EXISTS transfer_to_mv;

CREATE MATERIALIZED VIEW transfer_to_mv
ENGINE = MergeTree
ORDER BY (to, tick, timestamp)
AS SELECT
    id,
    from,
    to,
    p,
    op,
    tick,
    amt,
    block_number,
    timestamp
FROM transfer;

OPTIMIZE TABLE transfer_to_mv FINAL;

-- insert --
INSERT INTO transfer_to_mv SELECT
    id,
    from,
    to,
    p,
    op,
    tick,
    amt,
    block_number,
    timestamp
FROM transfer;