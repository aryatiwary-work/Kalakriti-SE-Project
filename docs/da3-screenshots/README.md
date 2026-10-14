# DA-3 screenshots

These are terminal screenshots for Digital Assignment 3 (Review 3). Each one was taken on 14 October 2026 while the command ran on this project.

## Testing

| Screenshot | Command |
|---|---|
| [Integration tests (29 passed)](01-integration-tests.png) | `python -m pytest tests/integration -v` |
| [Last-seat test: eight people book one seat at once](02-last-seat-test.png) | `python -m pytest tests/integration -v -k concurrent` |
| [Backend coverage (81 tests, 97%)](03-backend-coverage.png) | `python -m pytest --cov=app --cov-report=term -q` |
| [Regression tests (9 passed)](04-regression-tests.png) | `python -m pytest tests/regression -v` |
| [Mutation tests (69 of 70 caught)](05-mutation-tests.png) | `mutmut run`, `mutmut results`, `mutmut show 46` |
| [Frontend tests (9 passed)](06-frontend-tests.png) | `npx vitest run --silent` |
| [Browser tests on the full system (7 passed)](07-browser-tests.png) | `npx playwright test --reporter=list --workers=1` |

## Version management

| Screenshot | Command |
|---|---|
| [Commit history and branches](08-git-history.png) | `git log --oneline --graph`, `git branch -a` |
| [Pull request #26](09-pull-request-26.png) | `gh api repos/aryatiwary-work/Kalakriti-SE-Project/pulls/26` |
| [Recent GitHub Actions runs](10-github-actions-runs.png) | `gh run list` |
| [The four CI jobs on main](11-github-actions-jobs.png) | `gh run view 38526876357` |

## System building

| Screenshot | Command |
|---|---|
| [Starting the system](12-docker-compose-up.png) | `docker compose up -d`, `docker compose ps`, `curl localhost:8000/health` |
| [Production build of the website](13-frontend-build.png) | `npm run build` |
