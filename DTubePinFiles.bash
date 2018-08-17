echo 'Adding DTube videos in queue to IPFS node'
while read h; do
    ipfs add $h -t
    ipfs pin add $h
done < dtubehashvalues.txt