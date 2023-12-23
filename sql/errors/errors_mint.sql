-- table --
DROP TABLE IF EXISTS errors_mint;
CREATE TABLE errors_mint
(
    id          FixedString(66),
    code        UInt16()
)
ENGINE = ReplacingMergeTree
ORDER BY (id);
