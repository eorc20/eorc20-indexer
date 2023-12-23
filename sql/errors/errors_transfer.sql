-- table --
DROP TABLE IF EXISTS errors_transfer;
CREATE TABLE errors_transfer
(
    id          FixedString(66),
    code        UInt16()
)
ENGINE = ReplacingMergeTree
ORDER BY (id);
