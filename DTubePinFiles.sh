#!/bin/bash
echo 'Adding DTube videos in queue to IPFS node'
while IFS='' read -r h || [[ -n "$h" ]]; do
    ipfs add $h -t
    ipfs pin add $h
done < dtubehashvalues.txt