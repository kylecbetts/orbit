# Tasks

Everything that produces a "did it" — one-off tasks, recurring tasks, habits, and
the daily highlight.

## Model

The thing you do is separate from the schedule it repeats on.

| Concept        | What it is                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------- |
| **Task**       | The thing you do. Title, notes, chore flag, `is_work`, project, dates, resolution.          |
| **Recurrence** | An optional rule that issues tasks — anchor, schedule, whether late counts, the habit flag. |
| **Highlight**  | The one thing chosen for a day. Free text, or a link to a task planned for that day.        |

A one-off is a task with no recurrence, and that is the common case. A recurrence
holds only the rule — no title, no template. When its open task resolves, the next
task is issued as a copy of that one: title, notes, chore flag, `is_work`, project. So
there is one place to edit. Changing the current task changes every task issued
after it, while tasks already resolved keep what they were called when they were
done.

> A one-off tweak carries forward too — a note meant for this week reappears next
> time. Delete it when it does; an "only this one" toggle would reintroduce the
> two-surface edit this shape exists to avoid.

**Open states are derived; outcomes are stored.** Backlog, today, carried over and
upcoming are comparisons of `planned_for` and `due_on` against `logicalDate(now)` —
storing them would go stale at 03:00. How a task ended is a fact recorded once: a
nullable `resolution` with `resolved_at`, both set or both null.

| `resolution` | Set by | Meaning                                                                  |
| ------------ | ------ | ------------------------------------------------------------------------ |
| `done`       | You    | Completed within its window, or anytime if it has no window              |
| `late`       | You    | Completed after its date, where the recurrence allows late               |
| `missed`     | System | A scheduled task's window passed undone                                  |
| `skipped`    | You    | A scheduled task passed on deliberately; the next one issues on schedule |
| `dropped`    | You    | You stop tracking it — won't do it, ending a recurrence, a typo          |

Dates can't reconstruct a resolution: missed, skipped and dropped share the same
dates, and lateness depends on the rule as it was, not as it is. Nothing is
hard-deleted.

**Notes** are free text for detail — links, context, the steps of a routine. They
are never parsed or tracked. A routine is completed as a whole or not at all.

## Recurrence

`anchor` determines the next task's date and the fate of an undone one.

| `anchor`     | Next task                    | Undone task                          | Example                     |
| ------------ | ---------------------------- | ------------------------------------ | --------------------------- |
| `completion` | prior `resolved_at` + offset | Stays open; nothing new is issued    | Wash sheets every two weeks |
| `schedule`   | calendar rule                | Resolves `missed` when window closes | Fill pill organizer Sundays |

A scheduled task's **window** is its own day, or — where late counts — until the
next scheduled date. Filling the organizer on Monday is a `late` Sunday; meditating
on Tuesday leaves Monday `missed`. Either way the next task is issued, so two
missed Sundays are two records, never two open tasks.

A **habit** is a schedule-anchored recurrence flagged to surface streaks — a lens,
not a separate structure. Habit tasks appear in the habit ticker, not the task
list. Habits are always dated; there is no quota habit ("gym 4× a week, any
days").

| Resolution      | Streak                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| `done` / `late` | Extends                                                                   |
| `missed`        | Breaks                                                                    |
| `skipped`       | Bridges — the streak survives but doesn't grow, and its skips are counted |

An active streak shows its skips alongside its length — "12 days · 2 skipped" — so
bridging stays visible rather than quietly flattering the number.

Only schedule-anchored tasks can be skipped. A completion-anchored task has no
schedule to skip ahead on; "not this cycle" there is just moving `planned_for`.

Dropping a recurring task ends its recurrence — nothing further is issued. A
recurrence always has exactly one open task, so this is the only way one ends, and
retiring a habit is never recorded as failing at it.

## Today

Today lists every open, non-habit task with `planned_for` on or before today.

| Section   | Contents                                                |
| --------- | ------------------------------------------------------- |
| Highlight | Today's highlight, if one was set                       |
| Tasks     | Non-chores                                              |
| Habits    | Today's habit tasks, in a stable order                  |
| Chores    | Tasks flagged `chore` — anything under about 30 minutes |

Unfinished tasks are never rewritten at day end. A task planned for Tuesday that is
still open on Thursday simply stays on Today, labelled as carried over from
Tuesday. How stale it is comes from its date, and a task that has read "from three
weeks ago" for a while is its own prompt to drop or reschedule it.

Adding something mid-day is setting `planned_for` to today. Scheduling ahead is
setting it to a later date; the task is invisible until that day, then arrives on
its own.

> Under the 03:00 boundary, "tomorrow" is `logicalDate(now) + 1` — correct whether
> the thought arrives at 11 p.m. or at 1 a.m.

The **chore flag** is the only measure of size. It is a property of the task, and
chores never count toward the day's meaningful completions — a day of eight chores
and nothing else should not read as a productive one.

`planned_for` is an intention; `due_on` is a commitment. Neither is set on your
behalf.

## Highlight

At most one per logical day. Setting it creates the day's row; changing it updates
that row. No row means you didn't take the time to choose one — that absence is the
metric.

A highlight may link to a task planned for that day. A linked highlight is done
when its task is resolved `done` or `late`; only a free-text highlight has its own
done state. One source of truth either way.

## Rollover

At the 03:00 boundary a single pass resolves every scheduled task whose window has
closed as `missed` and issues its successor. It is the domain's only scheduled
process, and it touches nothing else — one-off tasks, planned dates and highlights
are left alone.

> The Pi is not always up. Rollover must be idempotent and able to catch up several
> days in one pass — a machine that has been off since Friday resolves Friday,
> Saturday and Sunday in order on Monday.

## The logical day

The day boundary is 03:00 local, not midnight. Work finished at 1 a.m. belongs to
the day that is ending, not the one starting.

Every date is derived through a single `logicalDate()` shared by API and client. It
drives rollover, recurrence windows, streaks and the Today query — not only
display. A habit ticked at 1:30 a.m. that breaks a streak is the bug that ends trust
in the app.

> 03:00 also sits outside the US DST transition window at 02:00, so the boundary
> never lands in a skipped or doubled hour.

## Work and projects

`is_work` marks a task as work; everything else is personal. Two values, forever —
a third sphere of life would be a migration, and that is accepted. Projects are
optional groupings that carry the same flag; a task's `is_work` matches its
project's when it has one.

Work items are pointers, not a mirror of a team board. A task may carry an external
reference — a Jira or Linear key and URL — rendered as a link and nothing more.
Orbit never reads or writes the remote system, and status is never synced: the
ticket's state is a team workflow, the task's state is your intent for today. They
differ legitimately.

External references are fields, not `shared/links`. Links model relations between
Orbit domains.

## Provenance

Who or what created a row — you, an iOS Shortcut, an AI tool call — is an audit
fact recorded in `shared/events`, never a field. AI-created tasks begin as
proposals and become rows only once confirmed.

A proposal is not a task. It lives in `ai/` as a tool name and a payload validated
against this domain's `types.ts` at the moment the AI calls the tool, so a
malformed proposal is rejected before you ever see it. Approving one calls the same
`service.ts` function an HTTP request would, after validating again against current
state. Tasks carry no draft flag: it would cover only creation, never a proposed
drop or reschedule, and every query would have to remember to exclude it.

No field may depend on which interface created the row. A client may choose a
default; it may never define a field's meaning.

## Invariants

| Rule                                                                              | Consequence                                                             |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| A recurrence never has more than one open task                                    | The list can't accumulate duplicates of the same commitment             |
| A scheduled task resolves `missed` when its window closes, and a successor issues | Missing is distinguishable from late, and never stacks                  |
| A completion-anchored recurrence issues the next task only on resolution          | Falling behind doesn't compress the interval                            |
| Each issued task copies its predecessor; a recurrence holds no template           | One place to edit, and resolved tasks keep their history                |
| Open states are derived from dates; a resolution is stored once                   | Nothing goes stale overnight, and editing a rule can't rewrite outcomes |
| Nothing is hard-deleted; every removal is `dropped`                               | One rule, and history never disappears                                  |
| `missed` breaks a streak; `skipped` bridges it and is counted                     | Honesty stays cheaper than gaming the record                            |
| Only schedule-anchored tasks can be skipped                                       | Skip always means "issue the next one on schedule"                      |
| Dropping a recurring task ends its recurrence                                     | One action to stop tracking, never recorded as failing at it            |
| Tasks have no draft state; AI proposals live in `ai/`                             | No query can leak an unapproved task                                    |
| Unfinished tasks are never rewritten at day end                                   | Carried-over is visible, derived, and costs no job                      |
| `planned_for` is an intention; `due_on` is a commitment                           | No fake overdue pressure                                                |
| Chores never count toward meaningful completions                                  | Volume can never look like progress                                     |
| At most one highlight per logical day                                             | The scarcity is the whole idea                                          |
| A linked highlight's done state comes from its task                               | The two can never disagree                                              |
| Notes are never parsed or tracked                                                 | Detail costs nothing to write and nothing to maintain                   |
| Rollover is idempotent and catches up in order                                    | A Pi that was off all weekend recovers correctly                        |
| No field may depend on which interface created the row                            | PWA, Shortcut and AI tool call stay genuinely equal                     |
| Every date is derived through `logicalDate()`                                     | One definition of "today" everywhere                                    |

## Events

Emitted to `shared/events`. Gamification is a later reader of this log, not a
rewrite of this domain — so emit faithfully, including the misses.

| Event                 | When                                                         |
| --------------------- | ------------------------------------------------------------ |
| `task.created`        | Any task created or issued — carries who or what created it  |
| `task.planned`        | `planned_for` set or changed — replanning history lives here |
| `task.completed`      | Resolved `done` or `late`                                    |
| `task.missed`         | Resolved by rollover                                         |
| `task.skipped`        | Resolved `skipped` — the next task issues on schedule        |
| `task.dropped`        | Resolved `dropped` — carries whether it ended a recurrence   |
| `highlight.set`       | The day's highlight chosen                                   |
| `highlight.changed`   | Swapped — the rate says whether highlights are realistic     |
| `highlight.completed` | Done, directly or through its linked task                    |

> Drops and skips must stay point-neutral for anything that later scores this log.
> Penalising them teaches you to hoard dead tasks, and backlog rot is what kills task
> systems.

## Out of scope

| Not this                            | Why                                                             |
| ----------------------------------- | --------------------------------------------------------------- |
| A morning planning ritual           | Friction; the highlight carries the "did I choose" signal       |
| Plan-adherence metrics              | No plan to adhere to; completions and events cover what remains |
| Effort beyond the chore flag        | One judgment — under 30 minutes or not — is all Today needs     |
| Tracked sub-steps and checklists    | Wouldn't be ticked in practice; notes hold the detail instead   |
| Quota habits                        | No task to complete; strains the recurrence model for one case  |
| Board views, sprints, work tracking | Competing with Linear loses; Orbit holds today's commitments    |
| Status sync with Jira or Linear     | Two-way merge problem, work credentials on a personal host      |
| Project milestones, % complete      | The road to rebuilding Jira at home                             |
| Points, rewards, fun money          | Reads the event log later; needs Finance to exist first         |
