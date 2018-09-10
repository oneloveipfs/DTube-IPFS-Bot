#!/bin/bash
./DTubePinFiles.sh
./DSoundPinFiles.sh
./cleanup.sh
ipfs pin ls -t recursive > Pinned/AllPinned.txt