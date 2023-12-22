-- view (code=6, 'mint amt must equal to lim') --
DROP TABLE IF EXISTS errors_2_mv;
CREATE MATERIALIZED VIEW errors_2_mv TO errors AS
SELECT
    id,
    2 as code,
    amt,
    tick,
    (SELECT first_value(lim) FROM deploy WHERE deploy.tick = tick) as lim
FROM mint
WHERE
    amt != lim;
