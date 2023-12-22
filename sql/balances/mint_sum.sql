-- view --
DROP TABLE IF EXISTS mint_sum_mv;

CREATE MATERIALIZED VIEW mint_sum_mv
ENGINE = SummingMergeTree
PRIMARY KEY (from, tick)
AS SELECT
    from,
    tick,
    sum(amt) as amt,
    count(id) as transactions,
    first_value(timestamp) as first_timestamp,
    last_value(timestamp) as last_timestamp
FROM mint
WHERE id IN (SELECT id FROM approve)
GROUP BY from, tick;

OPTIMIZE TABLE mint_sum_mv FINAL;

-- insert --
INSERT INTO mint_sum_mv SELECT
    from,
    tick,
    sum(amt) as amt,
    count(id) as transactions,
    first_value(timestamp) as first_timestamp,
    last_value(timestamp) as last_timestamp
FROM mint
WHERE id IN (SELECT id FROM approve)
GROUP BY from, tick;