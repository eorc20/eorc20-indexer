-- view --
DROP TABLE IF EXISTS pending_mv;

CREATE MATERIALIZED VIEW pending_mv
ENGINE = ReplacingMergeTree
PRIMARY KEY (id)
AS SELECT * FROM transfer
WHERE id NOT IN
(SELECT id FROM approve WHERE op = 'transfer') AND
id NOT IN (SELECT id FROM errors WHERE op = 'transfer');

-- insert --
INSERT INTO pending_mv
SELECT * FROM transfer
WHERE id NOT IN
(SELECT id FROM approve WHERE op = 'transfer') AND
id NOT IN (SELECT id FROM errors WHERE op = 'transfer');