-- table --
CREATE TABLE approve
(
    id          FixedString(66)
)
ENGINE = ReplacingMergeTree
ORDER BY (id);

-- table --
CREATE TABLE error
(
    id          FixedString(66),
    code        UInt16()
)
ENGINE = ReplacingMergeTree
ORDER BY (id);

-- table --
CREATE TABLE codes
(
    code        UInt16(),
    msg         String
)
ENGINE = ReplacingMergeTree
ORDER BY (code);

INSERT INTO codes VALUES (0, 'success');
INSERT INTO codes VALUES (2, 'invalid op');
INSERT INTO codes VALUES (3, 'invalid p');
INSERT INTO codes VALUES (4, 'invalid tick');


INSERT INTO codes VALUES (520, 'unknown error');