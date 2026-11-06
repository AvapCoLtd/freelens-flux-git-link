# freelens-flux-git-link 設計ドキュメント

本プラグインの設計判断の記録。使い方・デプロイ手順は[README](../README.md)を参照。

## 概要

FluxCDの `GitRepository` リソースに、`spec.url` を既定ブラウザで開くメニュー項目を追加する。

## 目的

1. FluxCD管理下の `GitRepository` を見ているとき、そのソースのGitリポジトリへワンクリックで遷移できるようにする

## 背景・解決したい課題

FreeLensで `GitRepository` のCustom Resourceを見ても、`spec.url` はテキストとして表示されるだけである。
そこへ遷移する手段が標準にはない。
組み込みのCustom Resourcesページ、公式[freelens-fluxcd-extension](https://github.com/freelensapp/freelens-fluxcd-extension)のページのいずれも同様である。
`spec.url` を手動でコピーしてブラウザに貼り付ける操作を無くす。

---

## スコープ

### やること

- `GitRepository` (`source.toolkit.fluxcd.io/v1` / `v1beta2` / `v1beta1`) への `kubeObjectMenuItems` 登録
- `spec.url` をhttps(またはhttp) URLに変換し、既定ブラウザで開く
- git remote URL形式(https/http/ssh/gitスキーム、scp風構文)の変換、資格情報(userinfo)の除去

### やらないこと

- `OCIRepository` / `HelmRepository` 等、`GitRepository` 以外のFluxCDソース種別への対応(将来の拡張候補)
- `spec.ref`(branch/tag/commit)を反映したディープリンク。GitHub/GitLab等フォージごとにURL規則が異なるため、まずは対応レポジトリのトップページを開くところから始める(将来の拡張候補)
- `GitRepository` の新規作成・編集・削除

---

## 機能仕様

### ユーザーフロー

1. FreeLensでクラスタに接続し、`GitRepository` のオブジェクト詳細ドロワー、または一覧ページを開く
2. 詳細ドロワーでは上部ツールバーにアイコン、一覧ページの行「⋮」メニューではアイコン+テキストの行として、本メニュー項目が表示される
3. クリックすると `spec.url` を変換したURLが既定ブラウザで開く
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
| 1 | 登録方式 | `kubeObjectMenuItems` に `Renderer.K8sApi.menuItemFor(GitRepository, { MenuItem })` で登録する。`kind: "GitRepository"` と `apiVersions`(v1/v1beta2/v1beta1 の3つ)はモデルクラス `GitRepository`(`src/renderer/git-repository.ts`)の static `kind` と `crd.apiVersions` から取る | Extension 公式 API。`kind`+`apiVersions` の組でグローバルに集約されるため、組み込みの Custom Resources ページ・公式 FluxCD 拡張のページのどちらで見ても、単一登録だけで両方に同じメニュー項目が現れる(型定義・実機で確認済み)。`menuItemFor` は `MenuItem` の props をモデルクラスに対して型検査する。オブジェクトリテラルで登録すると props は `KubeObjectMenuItemProps<any>` で受けられ、別 kind 用のコンポーネントでもコンパイルが通る |
| 2 | URL 変換 | 独自実装の `toWebUrl`(`src/renderer/git-url.ts`) | git remote URL(https/http/ssh/git、scp 風構文)を網羅的に扱える公式ユーティリティが見当たらないため自前実装。副作用のない純粋関数にして単体テストで担保する |
| 3 | ブラウザ起動 | renderer から `window.open(url)` | FreeLens 2.0 で `Common.Util.openExternal` は削除された。移行ガイドの代替は renderer の `window.open`。ホストの window-open ハンドラは新規ウィンドウを常に拒否し、URL を既定ブラウザへ渡す。`toWebUrl` は http/https しか返さないため、main + IPC で `shell.openExternal` を呼ぶ構成は不要 |
| 4 | 資格情報の除去 | https/http は `URL.host`、ssh/git/scp 風(scp は `ssh://` に正規化してから同じ `URL` パースに合流)は `URL.hostname` を使って URL を再構築する | `https://user:token@host/...` のような形式でも、userinfo をブラウザ URL に含めない。`URL.host`/`URL.hostname`(WHATWG URL)は元々 userinfo を含まないため、いずれの形式でも手動での strip 処理は不要 |
| 5 | GitRepository オブジェクトの型 | `Renderer.K8sApi.LensExtensionKubeObject` のサブクラス `GitRepository` を作り、型引数 `Spec` を `{ url?: string }` にする。インスタンスの `kind` / `apiVersion` は `declare` で static の値と同じリテラル型に絞る | `menuItemFor` の型検査は構造的で、`kind` / `apiVersion` がリテラル型でないモデルは同じ形の別モデルと区別されない(型定義の `LensExtensionKubeObject` と `menuItemFor` の JSDoc)。`declare` は出力に残らないため、実行時の挙動は変わらない |

---

## 技術メモ

- `kubeObjectMenuItems` の表示先は2箇所。オブジェクト詳細ドロワーの上部ツールバー(`toolbar: true` でアイコンのみ)と、一覧ページの行「⋮」メニュー(アイコン+テキスト)。
  ツールバーモードでアイコンのみになるのは、host側CSS(`renderer.css`)の `.MenuActions.toolbar .title{display:none}` によるものである。
  コンポーネント側で `toolbar` を見て出し分ける必要はない(`<span className="title">` は常にレンダーしてよい)。
- 型定義上の正確なエクスポート場所は `Common.Types.KubeObjectMenuItemProps` / `Common.Types.KubeObjectMenuRegistration`(`@freelensapp/extensions` の `dist/extension-api.d.ts`)。
  似た名前の `Renderer.Component.KubeObjectMenuProps` は個々の `MenuItem` コンポーネントのprops型ではない。
  host側が使う `<KubeObjectMenu>` 本体(`id` / `editable` / `removable` / `onMenuReady` を持つ、より大きい型)なので、混同しないこと。
- `KubeObjectMenuRegistration` は `{ kind, apiVersions, components: { MenuItem }, visible? }` の形で、ページ種別(組み込みCustom Resources / 公式FluxCD拡張)を指定する項目を持たない。
  JSDocによると、hostは登録された `kind` と `apiVersions` のオブジェクトにだけ項目を描画する。
- `menuItemFor` は、クラスにstatic `kind` が無いか `apiVersions` を決められないときに例外を投げる。
  `kubeObjectMenuItems` のフィールド初期化子で呼んでいるため、その場合は拡張ごとロードに失敗する。
