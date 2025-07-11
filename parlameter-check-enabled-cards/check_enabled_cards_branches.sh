#!/bin/zsh

# Script to check fetchCard function calls across all branches
# Usage: ./check_enabled_cards_branches.sh

# Create output directory
mkdir -p ./scripts/check_cards_output

# Store current branch
current_branch=$(git branch --show-current)

echo "Starting branch analysis..."
echo "Current branch: $current_branch"
echo "================================"

# Read each branch from branches.txt
while IFS= read -r branch || [[ -n "$branch" ]]; do
    # Skip empty lines
    [[ -z "$branch" ]] && continue

    echo "Processing branch: $branch"

    # Checkout the branch
    if git checkout "$branch" 2>/dev/null; then
        echo "  ✓ Checked out $branch"

        # Run the card checking script and save output
        if [[ -f "./scripts/check_enabled_cards.sh" ]]; then
            ./scripts/check_enabled_cards.sh > "./scripts/check_cards_output/${branch}.txt"
            echo "  ✓ Saved results to ./scripts/check_cards_output/${branch}.txt"
        else
            echo "  ✗ check_enabled_cards.sh not found in $branch"
            echo "No check_enabled_cards.sh script found" > "./scripts/check_cards_output/${branch}.txt"
        fi
    else
        echo "  ✗ Failed to checkout $branch"
        echo "Failed to checkout branch" > "./scripts/check_cards_output/${branch}.txt"
    fi

    echo ""
done < ./scripts/branches.txt

# Return to original branch
echo "Returning to original branch: $current_branch"
git checkout "$current_branch"

echo "================================"
echo "Analysis complete!"
echo "Results saved in ./scripts/check_cards_output/"
echo ""
echo "To view results:"
echo "  ls ./scripts/check_cards_output/"
echo "  cat ./scripts/check_cards_output/<branch_name>.txt"
