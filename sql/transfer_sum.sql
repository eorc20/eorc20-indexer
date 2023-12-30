-- view --
DROP TABLE IF EXISTS transfer_sum_mv;

CREATE MATERIALIZED VIEW transfer_sum_mv
ENGINE = SummingMergeTree
ORDER BY (from, to, tick)
AS SELECT
    from,
    to,
    tick,
    sum(amt) as amt,
    count(id) as transactions,
    first_value(timestamp) as first_timestamp,
    last_value(timestamp) as last_timestamp
FROM transfer
WHERE id IN (SELECT id FROM approve_transfer)
GROUP BY
    from,
    to,
    tick;

OPTIMIZE TABLE transfer_sum_mv FINAL;

-- insert --
INSERT INTO transfer_sum_mv SELECT
    from,
    to,
    tick,
    sum(amt) as amt,
    count(id) as transactions,
    first_value(timestamp) as first_timestamp,
    last_value(timestamp) as last_timestamp
FROM transfer
WHERE id IN (SELECT id FROM approve_transfer)
GROUP BY
    from,
    to,
    tick;