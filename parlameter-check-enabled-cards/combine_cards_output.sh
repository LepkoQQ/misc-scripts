#!/bin/zsh

# Script to combine all fetchCard analysis files into a CSV with branches as columns
# Usage: ./combine_cards_output.sh

output_dir="./scripts/check_cards_output"
csv_file="./scripts/cards_analysis.csv"
temp_dir="./scripts/cards_temp"

echo "Combining fetchCard analysis from $output_dir..."

# Create temporary directory for processing
mkdir -p "$temp_dir"

# First pass: collect all unique card names and file paths
echo "Collecting unique cards..."
all_cards_file="$temp_dir/all_cards.txt"
echo -n "" > "$all_cards_file"

for file in "$output_dir"/*.txt; do
    [[ ! -f "$file" ]] && continue

    echo "  Processing file: $file"

    while IFS=$'\t' read -r card_status card_name file_path; do
        # Skip empty lines
        [[ -z "$card_status" ]] && continue
        echo "$card_name|$file_path" >> "$all_cards_file"
    done < "$file"
done

echo "Found $(wc -l < "$all_cards_file") total card entries"

# Get unique card+file combinations
sort "$all_cards_file" | uniq > "$temp_dir/unique_cards.txt"
echo "Found $(wc -l < "$temp_dir/unique_cards.txt") unique cards"

# Second pass: collect all branch names
echo "Collecting branches..."
branches=()
for file in "$output_dir"/*.txt; do
    [[ ! -f "$file" ]] && continue
    branch=$(basename "$file" .txt)
    branches+=("$branch")
done

# Sort branches
branches=($(printf '%s\n' "${branches[@]}" | sort))

# Create CSV header
header="card_name,file_path"
for branch in "${branches[@]}"; do
    header="$header,$branch"
done
echo "$header" > "$csv_file"

# Process each unique card
echo "Building matrix..."
while IFS='|' read -r card_name file_path; do
    [[ -z "$card_name" ]] && continue

    # Start the row with card name and file path
    row="$card_name,$file_path"

    # For each branch, find the status of this card
    for branch in "${branches[@]}"; do
        branch_file="$output_dir/${branch}.txt"
        card_status=""

        if [[ -f "$branch_file" ]]; then
            # Search for this specific card in this branch's file
            while IFS=$'\t' read -r branch_status name path || [[ -n "$branch_status" ]]; do
                if [[ "$name" == "$card_name" && "$path" == "$file_path" ]]; then
                    # Clean up status field (remove brackets and spaces)
                    clean_status="${branch_status//\[/}"
                    clean_status="${clean_status//\]/}"
                    clean_status="${clean_status// /}"
                    case "$clean_status" in
                        "x") card_status="T" ;;
                        "") card_status="F" ;;
                        "o") card_status="O" ;;
                        *) card_status="U" ;;
                    esac
                    break
                fi
            done < "$branch_file"
        fi

        # If not found, mark as absent
        [[ -z "$card_status" ]] && card_status="A"

        row="$row,$card_status"
    done

    echo "$row" >> "$csv_file"
done < "$temp_dir/unique_cards.txt"
