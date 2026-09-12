---
title: 'Capturing QA context before it evaporates'
description: 'How I got developers to write down flags, setup steps and gotchas while they still knew them, and piped those notes onto the Jira ticket when QA needs them.'
pubDate: 2026-09-12T12:00:00+03:00
heroImage: '../../assets/blog/capturing-qa-context-before-it-evaporates/qa-notes-og.png'
draft: false
tags:
  - AI
  - Claude Code
  - tooling
---

Every ticket that reaches QA carries an invisible gap. The developer who built it knows which feature flag to enable, which migration to run first, and which edge case nearly broke them on Tuesday. The QA engineer picking it up knows none of that. They chase the developer on Slack, dig through merge requests, or test blind and file a bug that turns out to be a missing flag.

That knowledge exists for a short window: the coding session itself. A week later, the developer has moved on and half of it is gone. At work, I built a small pipeline with my team to catch it in that window and deliver it where it is used. Two audits of real merge requests taught me more about writing notes for a tester than the design did, so that comes first. The plumbing follows.

> **Key takeaways**
>
> - Ask the developer for QA notes at merge-request time, from their session, not from the diff. An agent reading the diff cannot see what tripped you up.
> - Trigger the handover when the ticket moves to QA, not when a merge request merges. My first shipped version got that wrong and produced one approval message per merge.
> - In the first 21 merge requests, about a third of the bullets were written for the wrong reader. The template had to name the audience outright.
> - Make re-runs converge. A content digest in a marker comment lets the pipeline re-fire without posting twice.
> - Keep a human in the loop. The proposed note goes to the ticket assignee as a Slack approve/reject before it touches Jira.

## Why not just read the diff?

My v0 design had no humans in it. On merge, an agent would fetch the diff, spot newly added feature flags, and post advisory acceptance criteria to the Jira ticket. I built the Jira connector for it before realising it answered the wrong question.

A diff tells you _what changed_. It does not tell you that the seed script needs re-running before the new screen renders anything, that the third-party sandbox returns stale data after 5pm, or that the migration ran fine locally against a table a fortieth the size of production. That information lives in the developer's head, and only for a few days. No amount of diff analysis recovers it.

So I inverted the design. The developer writes the notes. The automation only moves them. The connector survived; everything else from v0 was discarded.

## Capture at the source: the QA notes block

My team already generates merge-request descriptions with a [Claude Code skill](https://docs.claude.com/en/docs/claude-code/skills), the same mechanism I lean on for [my homelab tooling](/blog/my-homelab-runs-on-mcp/). Adding capture meant one new rule: when the change adds or flips a flag, needs setup before testing, surfaced a gotcha, or left something unverified, end the description with a short list.

```
QA notes:
- <flag added or flipped, with default state>
- <setup QA needs first: migration, config, seed data, account state>
- <gotcha hit while building or testing>
- <what you could not verify, and why>
```

**Sourced from the session, not the diff.** The skill has the conversation in which the work was done. It saw the developer hit the gotcha, and writes from that rather than re-narrating the change. When the description is written in a fresh session, or the work was done by hand, the skill has less to draw on and the list is correspondingly thinner. I accepted that: a thin list from a fresh session still beats no list.

**Each bullet stands alone.** Automation will lift the bullets off the merge request and onto a ticket. "See the issue above" dangles the moment it leaves the description.

**Skip the list when nothing applies.** Most small merge requests have no QA notes. A bullet saying "nothing to set up" is worse than no list, because it trains readers to skim.

**The format is a contract.** The heading is exactly `QA notes:` on its own line, followed immediately by `- ` bullets, nothing between them. The skill guarantees this so the parser downstream can be strict.

## What two audits of real merge requests taught me

I shipped the capture rule and waited. Then I read what came out. Two audits, six days and then two weeks after launch, reshaped the rules more than any design discussion did.

### Audit one: the wrong reader

Six days in, 21 merge requests across five repositories and five authors carried QA notes. Adoption was fine. Content was not. I tagged every bullet by hand against who it was actually written for, and about a third were aimed at someone other than the tester.

Four patterns accounted for the 18 misdirected bullets:

| Pattern                                             | Bullets | Example shape                                |
| --------------------------------------------------- | ------- | -------------------------------------------- |
| Reporting what the author tested and that it passed | 7       | "Verified locally, all steps green"          |
| Announcing that nothing needs setting up            | 5       | "No config changes required"                 |
| Merge and branch mechanics                          | 4       | "Stacked on !123, retarget after merge"      |
| Local checkout steps only a reviewer could use      | 2       | "Run the install step in the worktree first" |

All four are useful to _someone_. None are useful to the person testing the deployed build. So the rules now name each pattern and send it back to the body prose.

### Audit two: the bullet nobody asked for

Two weeks after launch, 91 merge requests carried notes, a cumulative count that includes the first 21. The tightening had half worked. Negative assertions and merge mechanics had all but vanished. Self-verification bullets held at 13% of the total, almost entirely "verified locally: 12/12 steps pass" on test-only merge requests, where the rules had left nothing else to say.

The most useful bullets in the corpus were ones no rule had invited. They said what the developer could _not_ verify, and why: bullets shaped like "could not exercise the fallback path, staging has no sandbox for it" or "migration ran clean on my copy, not timed against production volume". That is exactly the information a tester needs and exactly what nobody volunteers.

So the template gained its fourth line. A test-only merge request with nothing else to say now carries no list at all.

The setup rule was reframed too: a step belongs in the notes when the _tester_ needs it, wherever they run it. The old rule assumed QA only ever tests deployed builds, which was false for two of the team's end-to-end suites and had been pushing out genuine migration and credential bullets.

I then re-read every bullet in the 91-merge-request corpus against the rewritten rules. They excluded 32 of the 35 noise bullets. That is an in-sample number: the rules were written from this corpus and scored against it, so it measures fit, not generalisation. The three escapes were all maintainer-facing content, so the section now states the audience outright rather than listing exclusions.

The rules got shorter, not longer. Two paragraphs where there had been four.

## Trigger at the moment of use, not the moment of merge

v1 of the pipeline fired on merge-request merge. GitLab already sent merge events to a webhook lambda the team owned, so it was a one-line routing change. It shipped, ran for about a week, and was wrong.

A ticket usually spans several merge requests. Firing per merge meant the notes could never be complete, and every merge produced a fresh approval message for the developer. I closed that merge request and moved the trigger to the ticket.

Now a [Jira Automation rule](https://support.atlassian.com/cloud-automation/docs/jira-automation-actions/) posts to the lambda when a ticket transitions into the QA column. The rule authenticates with a shared secret in a header; the lambda rejects anything without it. Trimmed: `issueKey` and `statusName` come from the parsed request body.

```ts
if (!validateSharedSecret(event)) throw new Error('Token mismatch');

const projectKey = issueKey.split('-')[0];
const triggerStatus = QA_NOTES_TRIGGER_STATUSES[projectKey];
if (!triggerStatus) return; // board not enrolled
if (statusName !== triggerStatus) return; // not the QA column

const res = await fetch(`${TRIGGER_DEV_API}/tasks/qa-notes-run/trigger`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${secretKey}` },
  body: JSON.stringify({
    payload: { ticketKey: issueKey },
    options: { idempotencyKey: `qa-notes-${issueKey}`, idempotencyKeyTTL: '10m' },
  }),
});
if (!res.ok) throw new Error(`Trigger failed: ${res.status}`);
```

A bad secret, body, issue key or upstream response _throws_, so a misconfigured rule goes red in Jira's own audit log. Transitions on other boards or into other columns return cleanly, because legitimately ignored events must not train people to ignore a red log. The ten-minute [idempotency key](https://trigger.dev/docs/idempotency) collapses a burst of transitions into one run while still letting a re-transition hours later compile the notes again.

The per-board status map is the enrolment switch. Each team joins by adding a Jira rule and one line pairing their project key with their QA column name.

## The workflow: gather, digest, compile, approve, publish

![Flow diagram: a Jira ticket moving to QA triggers a lambda, which starts a Trigger.dev workflow that reads QA notes from merged merge requests, sends the assignee a Slack approval, and upserts one marker-tagged Jira comment. A dashed digest check stops repeat runs.](../../assets/blog/capturing-qa-context-before-it-evaporates/qa-notes-og.svg)

The workflow runs on [Trigger.dev](https://trigger.dev/).

```ts
const gather = await runStep(gatherQaNotes, payload);
if (gather.skip) return skipped(gather.skip);
if (gather.existingDigest === gather.digest) return skipped('unchanged');

const approverId = await resolveApprover(gather.assigneeEmail);
if (!approverId) return skipped('no assignee with a Slack match');

const compiled = await runStep(compileQaNote, { ticketKey, sources: gather.sources });

const token = await wait.createToken({ timeout: '48h' });
await runStep(requestApproval, { tokenId: token.id, note: compiled.note, channel: approverId });
const decision = await wait.forToken<{ approved: boolean }>(token);
if (!decision.ok || !decision.output?.approved) return skipped('rejected or timed out');

return runStep(publishQaNote, { ticketKey, note: compiled.note, digest: gather.digest });
```

### Gather

Gather derives everything from the ticket key. A board registry says which GitLab projects to sweep. For each, it searches merged merge requests mentioning the key, confirms the key from the branch name or title, and parses the notes block.

Two parser bugs surfaced in the first audit. Substring matching on "QA notes" false-positives on prose mentions of the phrase, including the skill's own rules quoted in a description. And a quarter of descriptions had trailing content after the list: stacked-on lines, cross-references, screenshots. So the parser is line-anchored, takes the _last_ heading, and stops at the first non-bullet line. It is strict about blank lines and bullet markers because the skill guarantees the format above.

```ts
export function parseQaNotes(description: string): string[] {
  const lines = description.split('\n');
  const heading = lines.reduce((last, l, i) => (l.trim() === 'QA notes:' ? i : last), -1);
  if (heading === -1) return [];
  const bullets: string[] = [];
  for (const line of lines.slice(heading + 1)) {
    if (!line.startsWith('- ')) break;
    bullets.push(line.slice(2).trim());
  }
  return bullets;
}
```

### Digest

Every gathered source, keyed by repository and merge-request id, feeds a sha256 digest. The published Jira comment carries that digest in a footer. On the next run, gather finds the marker comment, compares digests, and stops before spending a single model token if nothing changed.

```ts
export function qaNotesDigest(sources: QaNoteSource[]): string {
  const canonical = [...sources]
    .sort((a, b) => a.repoKey.localeCompare(b.repoKey) || a.mrIid - b.mrIid)
    .map((s) => `${s.repoKey}!${s.mrIid}:${s.bullets.join('\n')}`)
    .join('\n');
  return createHash('sha256').update(canonical).digest('hex').slice(0, 12);
}
```

Once a note is published, re-firing the pipeline with unchanged sources costs two API reads and nothing else.

### Compile

Claude Haiku, driven through the [Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview), merges the bullets from all merge requests into one note for the tester. The prompt is strict: keep every concrete fact, drop duplicates, flags and setup first, gotchas after, no invented facts, no test plans, no mention of the automation. The agent writes its answer as a JSON file in a scratch directory and the step reads it back, which is the repo's standard pattern for getting structured output out of an agent run without trusting its final chat message.

### Approve

The compiled note goes to the ticket assignee as a Slack DM with Approve and Reject buttons. The workflow parks on a Trigger.dev [waitpoint token](https://trigger.dev/docs/wait-for-token) for up to 48 hours. Nothing reaches Jira without a click.

v1 sent the DM to the merge-request author, resolved from the commit email. Once the run became per-ticket that stopped making sense: a ticket can have several authors and one name on it. The assignee is that name; it comes straight from Jira and needs no GitLab-to-Slack identity mapping.

The buttons call a second lambda. It verifies Slack's request signature, completes the waitpoint through the Trigger.dev API, and rewrites the DM with the outcome. Already-answered, expired, and environment-mismatched tokens all get a "no longer active" message instead of an error, so double clicks and stale DMs never surface as failures.

[Slack signs](https://api.slack.com/authentication/verifying-requests-from-slack) the exact raw bytes of the form-encoded body, and [API Gateway base64-encodes](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html) form bodies before your handler sees them. Verify against the decoded bytes or every signature fails.

```ts
const rawBody = event.isBase64Encoded
  ? Buffer.from(event.body ?? '', 'base64').toString('utf8')
  : (event.body ?? '');
```

### Publish

Publish resolves the marker comment at write time, not from a value passed down the chain. The workflow's queue slot is released while it waits on the token, so another run can complete in between. Update if the marker exists, add if not. Content is last-writer-wins: a late approval overwrites whatever is there with the note it was shown. I have not needed anything stronger yet.

## What I got wrong, and what is still open

- **Two runs can overlap.** The idempotency key only guards ten minutes. A second transition an hour into a pending approval starts a fresh run, which finds no marker comment yet, compiles, and sends the assignee a second DM. Both approvals publish; the later one wins. Cancelling the older token when a new run starts is the obvious fix and is not built.
- **Unassigned tickets skip silently.** The approval DM goes to the assignee. When I sampled the QA column at launch, roughly four in ten tickets sitting there had no assignee. The workflow logs a skip and messages nobody. Assigning before transitioning became a habit, not a guarantee.
- **A merge after the transition is missed** until someone re-transitions. Accepted for now. The digest check makes the re-transition free.
- **Status names are config.** The lambda matches Jira status display names. Rename a board's QA column and that board's trigger stops, via the clean-return path, with no error anywhere. A status id would have been safer than a string.
- **Rollout was label-gated.** Only tickets carrying an opt-in label ran for the first weeks. Cheap to add, easy to delete, and it let me watch real runs without surprising anyone.
- **I threw away about a week.** v0's diff-reading design never shipped. v1's on-merge trigger shipped and was reverted. Worth it: the wrong trigger taught me the right one faster than any design review would have.
- **No outcome numbers yet.** The pipeline is weeks old and still label-gated. Approve, reject and timeout counts exist in the run tags, and the honest test is whether QA stops chasing developers on Slack. This post is the build log. The results post comes when there is something to measure.

## What the tester sees (illustrative)

Shaped like real runs, invented content. Two merge requests on one ticket carry these notes:

```
MR A
QA notes:
- flag `newCheckout` added, off by default in all environments
- discount code path not verified, no test codes on staging

MR B
QA notes:
- needs the pricing seed script re-run on staging first
- flag `newCheckout` must be on to reach the new screen
```

The compiled comment on the ticket:

```
* Enable {{newCheckout}} on the test account. It is off by default everywhere.
* Re-run the pricing seed script on staging before opening the new screen.
* Discount codes were not verified. Staging has no test codes.

----
_qa-notes digest:3f9a1c0be7d2_
```

Duplicates merged, setup first, the unverified item kept and made specific. The footer is what lets the next run stop early.
