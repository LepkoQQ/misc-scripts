#!/bin/zsh

# Script to check fetchCard function calls in .ejs files
# Usage: ./check_fetchcard.sh

# Find all .ejs files and process them
find . -name "*.ejs" -type f | while read -r file; do
    # Read file line by line
    while IFS= read -r line || [[ -n "$line" ]]; do
        # Check if line contains fetchCard
        if [[ "$line" == *"fetchCard"* ]]; then
            # Extract the card name (first argument)
            card_name=""
            if [[ -z "$card_name" ]]; then
                # Try with single quotes
                card_name=$(echo "$line" | sed -n "s/.*fetchCard[ ]*('\([^']*\)'.*/\1/p")
            fi
            if [[ -z "$card_name" ]]; then
                # Try with double quotes
                card_name=$(echo "$line" | sed -n "s/.*fetchCard[ ]*(\"\([^\"]*\)\".*/\1/p")
            fi

            # Strip leading and trailing slashes
            card_name=$(echo "$card_name" | sed 's|^/||;s|/$||')

            # Clean up file path - remove ./parlasite/ prefix
            clean_file=$(echo "$file" | sed 's|^\./parlasite/||')

            # Check if it's commented out (looking for <%# or <!-- patterns)
            if [[ "$line" == *"<%#"*"fetchCard"* ]] || [[ "$line" == *"<!--"*"fetchCard"* ]]; then
                echo "[ ]\t$card_name\t$clean_file"
            elif [[ "$line" == *"<%"*"fetchCard"* ]]; then
                echo "[x]\t$card_name\t$clean_file"
            else
                # Handle other comment patterns or plain text
                echo "[o]\t$card_name\t$clean_file"
            fi
        fi
    done < "$file"
done
