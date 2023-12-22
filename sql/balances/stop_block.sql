SELECT sum(amt)
FROM mint
WHERE tick = 'eoss' AND block_number <= 21558260 AND transaction_index <= 316