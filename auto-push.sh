#!/bin/bash
cd "/home/deploy/apps/dopik-electronics/dopik-electronics (1)" || exit 1

while inotifywait -r -e modify,create,delete,move .; do
git add .
git commit -m "Auto-commit on $(date +'%Y-%m-%d %H:%M:%S')" || echo "Nothing to commit"
git push origin main
done
