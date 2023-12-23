-- table --
DROP TABLE IF EXISTS approve_mint;
CREATE TABLE approve_mint
(
    id          FixedString(66)
)
ENGINE = ReplacingMergeTree
ORDER BY (id);
