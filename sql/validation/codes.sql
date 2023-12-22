-- table --
CREATE TABLE IF NOT EXISTS codes
(
    code        UInt16(),
    msg         String
)
ENGINE = ReplacingMergeTree
ORDER BY (code);

INSERT INTO codes VALUES (0, 'success');

-- ticker errors --
INSERT INTO codes VALUES (1, 'tick must exists in deploy');

-- mint errors --
INSERT INTO codes VALUES (2, 'mint amt must equal to lim');

-- transfer errors --

-- deploy errors --