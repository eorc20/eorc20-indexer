-- Table for inscriptions --
CREATE TABLE IF NOT EXISTS operations (
    id          FixedString(66),
    p           LowCardinality(String),
    op          LowCardinality(String),
    tick        LowCardinality(String),
    max         UInt256(),
    lim         UInt32(),
    amt         UInt256(),
)
ENGINE = ReplacingMergeTree
PRIMARY KEY (id)
ORDER BY (id);