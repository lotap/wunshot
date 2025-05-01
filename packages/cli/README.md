<img src="../../apps/docs/src/assets/images/wordmark-duo.svg" alt="wunshot" width="256"/>

# wunshot CLI

This is the CLI/TUI for [wunshot](https://wunshot.dev/)

```sh
npx wunshot
```

> 🚧 **Caution:** This is a work in progress. Follow along with updates on my [Twitter/X](https://x.com/lotap_dev) 🚧

Currently non-functional.

In the future, this will be used for initializing projects, adding core modules, scaffolding new modules, checking diffs, and more

## Releases

Versions and Releases are managed using [changesets](https://github.com/changesets/changesets)

When a PR is merged into `trunk` with a changeset file, it will automatically trigger an additional PR with updates to the package version and changelog.

When that Version PR is merged, it will trigger another workflow that publishes the package on npm.
