echo 'Adding DSound videos in queue to IPFS node'
while read s; do
    ipfs add $s
    ipfs pin add $s
done < dsoundhashvalues.txt
