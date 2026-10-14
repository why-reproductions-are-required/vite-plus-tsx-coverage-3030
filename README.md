# Vite+ TSX coverage investigation

Minimal reproduction attempt for [voidzero-dev/vite-plus#3030](https://github.com/voidzero-dev/vite-plus/issues/3030).

**Status: the reported bug was not reproduced with this fixture.** `vp test` and the direct Vitest CLI both collect the `.tsx` files. The repository provides a small baseline that can be extended with the missing conditions from the affected project.

## Run

Use Node.js `26.11.1` and pnpm `10.34.7`:

```sh
pnpm install --frozen-lockfile
pnpm repro
```

If you use Vite+ to manage Node.js, you can select it explicitly:

```sh
vp env exec --node 26.11.1 pnpm install --frozen-lockfile
vp env exec --node 26.11.1 pnpm repro
```

`pnpm repro` runs all four cases below, checks that the test passed, and inspects each `coverage-final.json`. It exits successfully only when both TSX files are present, executed JSX has coverage, untested JSX remains uncovered, and each runner rejects the incomplete coverage. Reports are written to `coverage/<runner>/`; the comparison is saved in `coverage/comparison.json`.

To inspect a single run:

```sh
pnpm test:vp
pnpm test:vp --pool=threads
pnpm test:vp --pool=vmThreads
pnpm test:vitest
```

Each individual command should exit with code `1`: the test passes, but the intentional coverage gaps fail the `100%` thresholds. That failure is expected and shows that untested TSX is measured.

## Fixture

- `src/message.ts`: a fully covered TypeScript helper.
- `src/label.tsx`: an executed JSX component with one untested branch.
- `src/unused.tsx`: a JSX component that the tests never import.
- `runtime/`: a small in-repository JSX runtime that creates DOM elements.
- `tests/label.test.tsx`: one test that checks the rendered element.

The dependencies pin `vite-plus` to `1.0.0` and `@vitest/coverage-v8` to `5.0.1`. Vitest `5.0.1` is supplied through Vite+, rather than declared as a direct project dependency. Both configs use `jsdom`, the same `@ui-jsx` alias, automatic OXC JSX transformation, and explicit coverage globs for `.ts` and `.tsx`.

The standalone config exports a plain object. `scripts/run-vitest.mjs` resolves the real `vitest/dist/cli.js` from Vite+'s dependency tree and launches it directly, bypassing any `node_modules/.bin/vitest` shim. This compares the same Vitest and Vite dependencies with and without the `vp` command and Vite+'s `defineConfig` integration.

## Observed result

On macOS arm64 with Node.js `26.11.1`:

| Runner | `.ts` entries | `.tsx` entries | Tests passed | Exit code |
| --- | ---: | ---: | ---: | ---: |
| `vp test` | 1 | 2 | 1 | 1 |
| `vp test --pool=threads` | 1 | 2 | 1 | 1 |
| `vp test --pool=vmThreads` | 1 | 2 | 1 | 1 |
| Direct Vitest CLI | 1 | 2 | 1 | 1 |

`label.tsx` has `66.66%` statement coverage and `50%` branch coverage. `unused.tsx` has `0%` statement coverage. The fully covered `message.ts` is present in the JSON report, even though the text reporter does not list it.

## Limits

The issue does not include the original runtime, source files, aliases, lockfile, or complete configuration, so this fixture substitutes a minimal JSX runtime. It does not establish that the original project is unaffected.

The issue's standalone control uses `esbuild` options. With this dependency tree, that config warns that OXC takes precedence, ignores the custom JSX import source, and fails to resolve `react/jsx-dev-runtime`. The working standalone control here therefore uses the same OXC options as the Vite+ config; it does not compare OXC against esbuild. Coverage uses the supported `thresholds.perFile` option.
