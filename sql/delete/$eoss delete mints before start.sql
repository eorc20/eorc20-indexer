DELETE FROM mint
WHERE native_block_number <= deploy_native_block_number
AND transaction_index <= deploy_transaction_index
