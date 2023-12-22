SELECT sum(amt)
FROM mint
WHERE tick = 'eoss'
AND native_block_number <= 346056937
OR (native_block_number == 346056938 AND transaction_index <= 221)
