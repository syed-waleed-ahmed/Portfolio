<!-- Thanks for the PR! Fill out the sections that apply. -->

## Summary

<!-- What does this PR do, and why? Link any related issue. -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / cleanup
- [ ] Docs / README
- [ ] CI / tooling
- [ ] Dependency update

## Checklist

- [ ] `npm run lint` passes (frontend and backend)
- [ ] `npm test --prefix frontend` passes (if `frontend/src/data/` changed)
- [ ] `npm run test:invariants` passes
- [ ] `npm run build` succeeds (frontend; it runs lint, the content tests and the invariants first)
- [ ] `npm run size --prefix frontend` is within budget (frontend, after the build)
- [ ] `npm run test:e2e --prefix frontend` passes (if UI changed, after a build with `VITE_API_BASE_URL` empty)
- [ ] `npm test` passes (backend, if backend changed)
- [ ] `npm audit` reviewed if dependencies changed
- [ ] No real secrets committed (`.env`, API keys)
- [ ] Docs updated if behavior changed (`README.md` and/or `docs/`)
- [ ] `CHANGELOG.md` updated under `Unreleased` if the change is user-visible
- [ ] Postman collection in `postman/` updated if the API surface changed
- [ ] Tested locally on the affected viewport(s) if UI changed
- [ ] CSP hash in `frontend/public/_headers` recomputed if the inline script in `index.html` changed
- [ ] `frontend/.size-limit.json` changed only if this PR needs a new budget, with the reason

<!-- Contribution scope, conventions and commit format: CONTRIBUTING.md -->
<!-- Areas with non-obvious invariants: CONTRIBUTING.md#areas-that-need-extra-care -->


## Screenshots / notes

<!-- Optional. Drop screenshots, before/after, or extra context here. -->
