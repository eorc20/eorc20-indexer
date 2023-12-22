-- table --
DROP TABLE IF EXISTS errors;
CREATE TABLE errors
(
    id          FixedString(66),
    op          LowCardinality(String),
    code        UInt16()
)
ENGINE = ReplacingMergeTree
ORDER BY (id);
