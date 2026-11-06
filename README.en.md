# freelens-flux-git-link

![License](https://img.shields.io/github/license/AvapCoLtd/freelens-flux-git-link)
![Release](https://img.shields.io/github/v/release/AvapCoLtd/freelens-flux-git-link)

A FreeLens plugin that adds a menu item to open a FluxCD `GitRepository` in the default browser.

[日本語](README.md)

Viewing a `GitRepository` Custom Resource in FreeLens only shows `spec.url` as plain text; there is no built-in way to navigate to it, whether you're looking at the built-in Custom Resources pages or the official [freelens-fluxcd-extension](https://github.com/freelensapp/freelens-fluxcd-extension) pages.
See [docs/design.md](docs/design.md) for the full design rationale.

| Before | After |
|---|---|
| ![Standard drawer without the plugin](docs/images/before.png) | ![Hovering the added icon shows an "Open Git URL" tooltip](docs/images/after.png) |

`freelens-flux-git-link` adds an "Open Git URL" menu item to `GitRepository`, converting `spec.url` into an https (or http) URL and opening it in the default browser.
It handles `ssh://` URLs and scp-like syntax (`git@host:path`) too, and strips any credentials (userinfo) embedded in the URL before opening it.

## Compatibility

Requires FreeLens 2.0.0 or later (see `engines` in `package.json`). It does not load on 1.x.

On FreeLens 1.x, use v0.1.0, the last release for 1.x.
v0.1.0 targets FreeLens 1.8.0 or later within 1.x and does not load on 2.0.

On the Windows build of FreeLens 2.0.0, loading and enabling the extension were confirmed in the logs (2026-11-06).
The menu item and opening the browser have not yet been checked on screen with 2.0.0.

## Install

1. Download a `.tgz` from GitHub Releases. For FreeLens 2.x, pick a release newer than v0.1.0
2. On the Extensions screen in FreeLens, enter the path to the downloaded `.tgz` and install it
3. To update, repeat the same steps with the new `.tgz`

FreeLens places installed extensions in its extensions directory (on Windows, `%APPDATA%\Freelens\extensions\freelens-flux-git-link`).
Extracting the `.tgz` produces a `package/` directory.
To place it by hand, copy the contents of `package/` directly under that directory (so that `package.json` sits at its top level).
Alternatively, enter the path of the extracted `package/` directory on the Extensions screen.
An extension placed by hand is registered as disabled, so restart FreeLens and enable it on the Extensions screen.

## Usage

1. Connect to a cluster in FreeLens and open a `GitRepository`'s object details drawer or a list page
2. "Open Git URL" appears as an icon in the details drawer's top toolbar, and as an icon+text row in the list page's row "⋮" menu
3. Clicking it opens the Git repository corresponding to `spec.url` in the default browser

If `spec.url` is unsupported (e.g. `oci://`), empty, or malformed, the menu item itself is not shown.

Only `GitRepository` is supported for now.
Support for other FluxCD source kinds (`OCIRepository`, `HelmRepository`) and deep links reflecting `spec.ref` are candidates for future work (see [design.md](docs/design.md)).

## Links

- https://github.com/AvapCoLtd/freelens-flux-git-link (public)
- https://gitlab.avaper.day/avap/freelens-plugins/freelens-flux-git-link (development)

Development: see [CONTRIBUTING.md](CONTRIBUTING.en.md).

## License

MIT
