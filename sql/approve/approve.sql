-- table --
DROP TABLE IF EXISTS approve;
CREATE TABLE approve
(
    op          LowCardinality(String),
    id          FixedString(66)
)
ENGINE = ReplacingMergeTree
ORDER BY (op, id);
