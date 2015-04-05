#!/bin/bash
set -ev
for file in ./coverage/*/*.info
do
 cat "$file" | codeclimate
done
