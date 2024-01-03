-- view --
DROP TABLE IF EXISTS mint_from_mv;

CREATE MATERIALIZED VIEW mint_from_mv
ENGINE = MergeTree
ORDER BY (from, tick, timestamp)
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
FROM mint;

OPTIMIZE TABLE mint_from_mv FINAL;

-- insert --
INSERT INTO mint_from_mv SELECT
    id,
    from,
    to,
    p,
    op,
    tick,
    amt,
    block_number,
    timestamp
FROM mint;