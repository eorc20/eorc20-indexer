-- table --
CREATE TABLE IF NOT EXISTS errors
(
    id          FixedString(66),
    code        UInt16()
)
ENGINE = ReplacingMergeTree
ORDER BY (id);
