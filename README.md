[English](README.en.md)

# freelens-flux-git-link

![License](https://img.shields.io/github/license/AvapCoLtd/freelens-flux-git-link)
![Release](https://img.shields.io/github/v/release/AvapCoLtd/freelens-flux-git-link)

FluxCDの `GitRepository` を既定ブラウザで開くメニューを追加するFreeLensプラグイン。

FreeLensで `GitRepository` のCustom Resourceを見ても、`spec.url` はテキストとして表示されるだけである。
そこへ遷移する手段が標準にはない。
組み込みのCustom Resourcesページ、公式[freelens-fluxcd-extension](https://github.com/freelensapp/freelens-fluxcd-extension)のページのいずれで見ていても同様である。
詳細は[設計ドキュメント](docs/design.md)を参照。

| Before | After |
|---|---|
| ![プラグイン未導入の標準ドロワー](docs/images/before.png) | ![追加されたアイコンにホバーすると「Open Git URL」ツールチップが表示される](docs/images/after.png) |

`freelens-flux-git-link` は `GitRepository` に「Open Git URL」メニュー項目を追加する。
`spec.url` をhttps(またはhttp)のURLに変換して既定ブラウザで開く。
`ssh://` や `git@host:path` のようなscp風構文にも対応する。
資格情報(userinfo)がURLに含まれる場合は取り除いてから開く。

## 対応バージョン

FreeLens 2.0.0以上(`package.json` の `engines` を参照)。1.xでは読み込まれない。

FreeLens 1.xでは、1.x向けの最後のリリースであるv0.1.0を使う。
v0.1.0はFreeLens 1.8.0以上の1.x向けで、2.0では読み込まれない。

Windows版FreeLens 2.0.0で、読み込みと有効化までをログで確認した(2026-11-06)。
画面上でのメニュー表示とブラウザ起動は、2.0.0ではまだ確認していない。

## インストール

1. GitHub Releasesから `.tgz` をダウンロードする。FreeLens 2.xではv0.1.0より新しいリリースを選ぶ
2. FreeLensのExtensions画面で、ダウンロードした `.tgz` のパスを指定してインストールする
3. 更新時も同様に新しい `.tgz` を取得して再インストールする

インストールした拡張はFreeLensの拡張機能ディレクトリに置かれる(Windowsでは `%APPDATA%\Freelens\extensions\freelens-flux-git-link`)。
`.tgz` を展開すると `package/` ディレクトリができる。
手で置く場合は、`package/` の中身をこのディレクトリの直下に置く(`package.json` が直下に来る)。
または、展開した `package/` のパスをExtensions画面で指定する。
手で置いた拡張は無効の状態で登録されるため、FreeLensを再起動してからExtensions画面で有効にする。

## 使い方

1. FreeLensでクラスタに接続し、`GitRepository` のオブジェクト詳細ドロワー、または一覧ページを開く
2. 詳細ドロワーでは上部ツールバーにアイコン、一覧ページの行「⋮」メニューではアイコン+テキストの行として「Open Git URL」が表示される
3. クリックすると `spec.url` に対応するGitリポジトリが既定ブラウザで開く

`spec.url` が未対応スキーム(`oci://` 等)・空・不正な値の場合、メニュー項目自体が表示されない。

現時点では `GitRepository` のみが対象。
`OCIRepository` / `HelmRepository` 等の他のFluxCDソース種別への対応は今後の対応候補である。
`spec.ref` を反映したディープリンクも同様である([design.md](docs/design.md)参照)。

## リンク

- https://github.com/AvapCoLtd/freelens-flux-git-link (公開用)
- https://gitlab.avaper.day/avap/freelens-plugins/freelens-flux-git-link (開発用)

開発: [CONTRIBUTING.md](CONTRIBUTING.md)を参照。

## License

MIT
