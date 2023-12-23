-- table --
DROP TABLE IF EXISTS approve_transfer;
CREATE TABLE approve_transfer
(
    id          FixedString(66)
)
ENGINE = ReplacingMergeTree
ORDER BY (id);
