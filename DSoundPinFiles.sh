#!/bin/bash
echo 'Adding DSound audio in queue to IPFS node'
while IFS='' read -r h || [[ -n "$h" ]]; do
    ipfs add $h
    ipfs pin add $h
done < dsoundhashvalues.txt