-- table --
DROP TABLE IF EXISTS codes;
CREATE TABLE codes
(
    code        UInt16(),
    msg         String
)
ENGINE = ReplacingMergeTree
ORDER BY (code);

INSERT INTO codes VALUES (0, 'success');

-- mint errors --
INSERT INTO codes VALUES (1, 'mint before start block');
INSERT INTO codes VALUES (2, 'mint after stop block');

-- transfer errors --
INSERT INTO codes VALUES (3, 'transfer after start block');
INSERT INTO codes VALUES (4, 'transfer insufficient balance');
INSERT INTO codes VALUES (5, 'transfer cannot transfer to self');
INSERT INTO codes VALUES (6, 'transfer decimals is invalid');

-- block errors --
INSERT INTO codes VALUES (10, 'native block not final');
