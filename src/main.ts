import * as core from '@actions/core';
import * as github from '@actions/github';

type GitHub = ReturnType<typeof github.getOctokit>;

async function removeExistingApprovalsIfExist(
  client: GitHub,
  pr: any,
  x: string,
  dismissMessage: string
) {
  // Get list of all reviews on a PR
  const { data: listReviews } = await client.rest.pulls.listReviews({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: pr.number,
  });

  // Get list of all commits to the PR
  const { data: listCommits } = await client.rest.pulls.listCommits({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: pr.number,
  });

  // Remove PR approvals by any committer to the PR
  for (let review of listReviews) {
    if (
      review.state === 'APPROVED' &&
      review.user &&
      !x.split(' ').includes(review.user.login)
    ) {
      core.info(
        `Removing an approval (${review.id}) from ${review.user?.login} (${dismissMessage})`
      );
      const dismissResponse = await client.rest.pulls.dismissReview({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: pr.number,
        review_id: review.id,
        message: `${review.user?.login} ${dismissMessage}`,
      });
      core.debug(`dismissResponse: ${JSON.stringify(dismissResponse)}`);
      core.setFailed(`${review.user?.login} ${dismissMessage}`);
    }
  }
}

async function run() {
  try {
    const token = core.getInput('github-token', { required: true });
    const x = core.getInput('x', { required: true });
    const dismissMessage = core.getInput('dismiss-message', { required: true });

    const { pull_request: pr } = github.context.payload;
    if (!pr) {
      throw new Error(
        'Event payload missing `pull_request` - workflow containing this action is supposed to be triggered by `pull_request` or `pull_request_target` event'
      );
    }

    const client = github.getOctokit(token);

    await removeExistingApprovalsIfExist(client, pr, x, dismissMessage);
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run();
