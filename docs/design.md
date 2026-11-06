# freelens-flux-git-link 設計ドキュメント

本プラグインの設計判断の記録。使い方・デプロイ手順は [README](../README.md) を参照。

## 概要

FluxCD の `GitRepository` リソースに、`spec.url` を既定ブラウザで開くメニュー項目を追加する。

## 目的

1. FluxCD 管理下の `GitRepository` を見ているとき、そのソースの Git リポジトリへワンクリックで遷移できるようにする

## 背景・解決したい課題

FreeLens で `GitRepository` の Custom Resource を見ても、`spec.url` はテキストとして表示されるだけである。
そこへ遷移する手段が標準にはない。
組み込みの Custom Resources ページ、公式 [freelens-fluxcd-extension](https://github.com/freelensapp/freelens-fluxcd-extension) のページのいずれも同様である。
`spec.url` を手動でコピーしてブラウザに貼り付ける操作を無くす。

---

## スコープ

### やること

- `GitRepository` (`source.toolkit.fluxcd.io/v1` / `v1beta2` / `v1beta1`) への `kubeObjectMenuItems` 登録
- `spec.url` を https(または http) URL に変換し、既定ブラウザで開く
- git remote URL 形式(https/http/ssh/git スキーム、scp 風構文)の変換、資格情報(userinfo)の除去

### やらないこと

- `OCIRepository` / `HelmRepository` 等、`GitRepository` 以外の FluxCD ソース種別への対応(将来の拡張候補)
- `spec.ref`(branch/tag/commit)を反映したディープリンク。GitHub/GitLab 等フォージごとに URL 規則が異なるため、まずは対応レポジトリのトップページを開くところから始める(将来の拡張候補)
- `GitRepository` の新規作成・編集・削除

---

## 機能仕様

### ユーザーフロー

1. FreeLens でクラスタに接続し、`GitRepository` のオブジェクト詳細ドロワー、または一覧ページを開く
2. 詳細ドロワーでは上部ツールバーにアイコン、一覧ページの行「⋮」メニューではアイコン+テキストの行として、本メニュー項目が表示される
3. クリックすると `spec.url` を変換した URL が既定ブラウザで開く
4. `spec.url` が変換不能(未対応スキーム・空・不正な値)な場合、メニュー項目自体が表示されない

### Input/Output

| 操作 | Input | Output | 備考 |
|------|-------|--------|------|
| メニュー項目クリック | なし | `spec.url` を変換した URL を既定ブラウザで開く | `window.open` 経由(ホストが既定ブラウザへ渡す) |
| URL 変換不能時 | `spec.url` が未対応スキーム/空/不正 | メニュー項目自体を非表示(`null` を返す) | 誤って壊れた URL を開くボタンを出さない |

---

## 設計決定事項

| # | 項目 | 決定 | 理由 |
|---|------|------|------|
| 1 | 登録方式 | `kubeObjectMenuItems`(`kind: "GitRepository"`、`apiVersions` に v1/v1beta2/v1beta1 の3つ) | Extension 公式 API。`kind`+`apiVersions` の組でグローバルに集約されるため、組み込みの Custom Resources ページ・公式 FluxCD 拡張のページのどちらで見ても、単一登録だけで両方に同じメニュー項目が現れる(型定義・実機で確認済み) |
| 2 | URL 変換 | 独自実装の `toWebUrl`(`src/renderer/git-url.ts`) | git remote URL(https/http/ssh/git、scp 風構文)を網羅的に扱える公式ユーティリティが見当たらないため自前実装。副作用のない純粋関数にして単体テストで担保する |
| 3 | ブラウザ起動 | renderer から `window.open(url)` | FreeLens 2.0 で `Common.Util.openExternal` は削除された。移行ガイドの代替は renderer の `window.open`。ホストの window-open ハンドラは新規ウィンドウを常に拒否し、URL を既定ブラウザへ渡す。`toWebUrl` は http/https しか返さないため、main + IPC で `shell.openExternal` を呼ぶ構成は不要 |
| 4 | 資格情報の除去 | https/http は `URL.host`、ssh/git/scp 風(scp は `ssh://` に正規化してから同じ `URL` パースに合流)は `URL.hostname` を使って URL を再構築する | `https://user:token@host/...` のような形式でも、userinfo をブラウザ URL に含めない。`URL.host`/`URL.hostname`(WHATWG URL)は元々 userinfo を含まないため、いずれの形式でも手動での strip 処理は不要 |
| 5 | GitRepository オブジェクトの型 | `KubeObject` を継承し `spec` の形だけ `{ url?: string }` に絞り込む。`spec` 自体は required のまま | `KubeObject.spec` は必須プロパティ(型は `unknown`)。`spec` ごと optional にすると `KubeObjectMenuItemProps<T extends KubeObject>` の型制約を満たせずコンパイルエラーになることを実機の tsc で確認済み(「Property 'spec' is optional ... but required ...」) |

---

## 技術メモ

- `kubeObjectMenuItems` の表示先は2箇所。オブジェクト詳細ドロワーの上部ツールバー(`toolbar: true` でアイコンのみ)と、一覧ページの行「⋮」メニュー(アイコン+テキスト)。
  ツールバーモードでアイコンのみになるのは、host 側 CSS(`renderer.css`)の `.MenuActions.toolbar .title{display:none}` によるものである。
  コンポーネント側で `toolbar` を見て出し分ける必要はない(`<span className="title">` は常にレンダーしてよい)。
- 型定義上の正確なエクスポート場所は `Common.Types.KubeObjectMenuItemProps` / `Common.Types.KubeObjectMenuRegistration`(`@freelensapp/core` の `extensions/common-api/types.d.ts` 経由)。
  似た名前の `Renderer.Component.KubeObjectMenuProps` は個々の `MenuItem` コンポーネントの props 型ではない。
  host 側が使う `<KubeObjectMenu>` 本体(`id` / `editable` / `removable` / `onMenuReady` を持つ、より大きい型)なので、混同しないこと。
- `kubeObjectMenuItemRegistratorInjectable`(`@freelensapp/core`)の型定義から、登録は `{kind, apiVersions, Component, enabled, orderNumber}` の形で拡張ローダー配下に集約されることが読み取れる。ページ種別(組み込み Custom Resources / 公式 FluxCD 拡張)ごとに別registrationが必要な構造にはなっていない。
