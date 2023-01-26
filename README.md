# GitHub Action: approvals gatekeeper

Github doesn't differentiate between reviewers from one group or the other. A review is a review. This action
allows rejecting approvals from users that are not in your list.

A great use case is combining this action with https://github.com/tj-actions/changed-files to conditionally
allow groups of reviewers for different types of files.

## Usage instructions

```yaml
name: dismiss code reviews from users not in list

on:
  pull_request_review:
    types: [submitted]

jobs:
  dismiss-code-reviews:
    runs-on: ubuntu-latest
    if: github.event.review.state == 'approved'
    steps:
      - uses: stephanebruckert/approvals-gatekeeper-action@v0.1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          x: stephanebruckert some-other-username
```
