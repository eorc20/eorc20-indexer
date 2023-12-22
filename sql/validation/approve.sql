-- table --
DROP TABLE IF EXISTS approve;
CREATE TABLE approve
(
    id          FixedString(66),
    op          LowCardinality(String)
)
ENGINE = ReplacingMergeTree
ORDER BY (id);
