-- table --
DROP TABLE IF EXISTS errors;
CREATE TABLE errors
(
    op          LowCardinality(String),
    id          FixedString(66),
    code        UInt16()
)
ENGINE = ReplacingMergeTree
ORDER BY (op, id);
