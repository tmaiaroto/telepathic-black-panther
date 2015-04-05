#!/bin/bash
set -ev
for file in ./coverage/*/*.info
do
 codeclimate < "$file"
done
