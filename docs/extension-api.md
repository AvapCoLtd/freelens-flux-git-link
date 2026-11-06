---
last_verified: 2026-11-06
---

# FreeLens 拡張 API の情報源

FreeLens 拡張開発で参照すべき情報源へのポインタ集。
陳腐化を避けるため、ここには内容を転記せずリンク先を一次情報として参照すること。
リンク切れ・記述齟齬を見つけたら本ファイルを更新する(frontmatter の `last_verified` も併せて更新)。

## 一次情報(FreeLens 公式)

| 情報源 | URL | 何がわかるか |
|---|---|---|
| FreeLens 公式ドキュメント | <https://freelensapp.github.io/docs/> | 拡張の全体像。`LensRendererExtension` / `LensMainExtension` クラス、`globalPages` / `clusterPages` 等の登録ポイント |
| freelensapp/freelens(本体リポジトリ) | <https://github.com/freelensapp/freelens> | 実装の最終的な真実。API の挙動が不明なときはここを読む |
| freelens 本体 Wiki: Extensions | <https://github.com/freelensapp/freelens/wiki/Extensions> | 拡張の配布・インストール周りの運用情報 |
| freelensapp/freelens-example-extension | <https://github.com/freelensapp/freelens-example-extension> | 公式サンプル。clusterPages でのカスタムページ実装例 |
| freelensapp/freelens-fluxcd-extension | <https://github.com/freelensapp/freelens-fluxcd-extension> | 公式 FluxCD 拡張。`GitRepository` 等 FluxCD リソースのページ登録の実例 |
| FreeLens v2 移行ガイド | <https://github.com/freelensapp/freelens/blob/v2.0.0/docs/extensions/migrating-from-v1.md> | v1 拡張を v2 へ移す際の必須変更。削除・改名された API の対応表(v1→v2 rename table)もここにある |
| npm: `@freelensapp/extensions` | <https://www.npmjs.com/package/@freelensapp/extensions> | 拡張が依存する公開 API パッケージ。v2 では `globalThis.FreelensExtensionApi` を読むだけの shim と、単一の型定義 `dist/extension-api.d.ts` からなる。型定義がそのまま API リファレンスになる |
| npm: `@freelensapp/legacy-extensions` | <https://www.npmjs.com/package/@freelensapp/legacy-extensions> | 旧 Lens (OpenLens) 拡張 API との互換レイヤ |

## 補助情報(旧 Lens / upstream)

FreeLens は OpenLens の fork。
拡張の概念モデル(main/renderer の 2 プロセス構成、IPC、各種 Registration)は旧 Lens のドキュメントがそのまま概ね通用する。
記述が FreeLens の現状と食い違う場合は上の一次情報を優先する。

| 情報源 | URL | 何がわかるか |
|---|---|---|
| Lens Extension API docs | <https://api-docs.k8slens.dev/> | ガイドが体系的。Extension Anatomy / Main Extension / Renderer Extension / IPC(`broadcast` / `invoke` / `listen` / `handle`)の解説 |

## 実例

外部ドキュメントより先に、まず動いている実例として本リポジトリの `src` を読むこと。

- freelens-flux-git-link(本リポジトリ、[README](../README.md)):
  `kubeObjectMenuItems` 登録(`kind`+`apiVersions` によるマッチング)+ `window.open` によるブラウザ起動の使用例(FreeLens 2.0対応済み)。
  [docs/design.md](design.md) に git remote URL 変換規則や型制約(`KubeObjectMenuItemProps<T extends KubeObject>`)まわりの設計判断の記録あり
- [freelens-oci-cluster](https://github.com/AvapCoLtd/freelens-oci-cluster):
  `clusterPageMenus` 登録 + `node:child_process`(`execFile`)による外部 CLI 呼び出しの使用例。
  `Renderer.K8sApi` の KubeObjectStore(`nodesStore` / `serviceStore` / `persistentVolumeStore` 等)使用例。
  `Common.Util.openExternal` を使うボタン実装(`console-button.tsx`)の先行実例でもある。
  ただしFreeLens 1.x向けの実装で、`openExternal` とrendererからのNode利用はv2では使えない
- [freelens-cluster-sidebar](https://github.com/AvapCoLtd/freelens-cluster-sidebar):
  `topBarItems` 登録 + `ReactDOM.createPortal` による常駐 UI、`Renderer.Catalog` の使用例
- [freelens-locale-ja](https://github.com/AvapCoLtd/freelens-locale-ja):
  公式登録 API を使わない実行時パッチ方式の例。
  `src/renderer/collector.ts` は renderer コードから `node:fs` を直接 import して使う実例
- ビルド枠組み(Viteをrenderer用・main用の2回実行し、どちらもESMで出力する。host提供ライブラリは `globalThis.FreelensExtensionApi` へ置き換える)は `vite.config.mjs` と `build/vite-plugin-host-modules.mjs` に記載

## 型定義 = API リファレンス

公開 API の正確な形は型定義を直接読むのが確実。
v2では `node_modules/@freelensapp/extensions/dist/extension-api.d.ts` の1ファイルに全名前空間がまとまっている。

## APIs used(このプラグインが使う API)

- `Renderer.LensExtension.kubeObjectMenuItems: KubeObjectMenuRegistration[]`。
  `{ kind, apiVersions, components: { MenuItem }, visible? }` の配列を登録する。
- 個々の `MenuItem` コンポーネントが受け取る props の型は `Common.Types.KubeObjectMenuItemProps<T extends KubeObject>`(`{ object: T; toolbar?: boolean }`)。
  `Common.Types` 名前空間からエクスポートされる。
  似た名前の `Renderer.Component.KubeObjectMenuProps` は host 側の `<KubeObjectMenu>` 本体(`id` / `editable` / `removable` / `onMenuReady` を持つ、より大きい型)である。
  個々の `MenuItem` の props とは別物なので注意。
- `window.open(url)`(renderer): 既定ブラウザでURLを開く。
  ホストのwindow-openハンドラが新規ウィンドウを拒否し、URLを既定ブラウザへ渡す。
  FreeLens 2.0.0の `app.asar` 内 `static/build/main.js` の `setWindowOpenHandler` で確認した。
  v1の `Common.Util.openExternal` はv2で削除された。
- `Renderer.Component.MenuItem` / `Renderer.Component.Icon`: メニュー項目本体とアイコン描画。

### 検証済みの挙動(実機・型定義で確認)

- `kubeObjectMenuItems` は `kind`+`apiVersions` の組でグローバルに集約される。
  ページ側(組み込みの Custom Resources ページ、公式 FluxCD 拡張のページ)ごとに別registrationは不要である。
  単一の登録が両方に反映される。
- 表示先は2箇所: オブジェクト詳細ドロワーの上部ツールバー(アイコンのみ)と、一覧ページの行「⋮」メニュー(アイコン+テキスト)。
  ツールバーモードでアイコンのみになるのは host 側 CSS の `.MenuActions.toolbar .title{display:none}` によるもの(`renderer.css` で確認)。コンポーネント側で `toolbar` prop を見て `<span className="title">` の出し分けをする必要はない。
- `KubeObject.spec` は必須プロパティ(型は `unknown`)。`GitRepository` 用の型を `interface X extends KubeObject { spec?: {...} }` のように `spec` ごと optional にすると、`KubeObjectMenuItemProps<T extends KubeObject>` の型制約を満たせず tsc がエラーにする(実機で確認: 「Property 'spec' is optional in type 'X' but required in type 'KubeObject'」)。`spec` は required のまま形だけ絞り込むこと。

## 要点(ポインタの読み方)

- 拡張は renderer(UI・React)と main(Electron main プロセス)の 2 エントリポイント構成。
  独立ページ追加は renderer 側の `globalPages` / `clusterPages`(`PageRegistration[]`)に登録する。
- FreeLens 2.0のrendererにはNode / Electronの保証がない(`require()` も含む)。
  rendererエントリはESMとしてブラウザ向けにビルドする。
  Nodeが要る処理はmainに置き、IPC(`broadcast`/`invoke`/`listen`/`handle`)で呼ぶ。
  1.xではrendererから `node:child_process` 等を直接使えたが、その前提はv2では成り立たない。
- `clusterPageMenus` は上流 Lens の公式ガイド例より**公式 FluxCD 拡張の実装を正とする**(<https://github.com/freelensapp/freelens-fluxcd-extension>)。
  実機で確認した差異が2件ある。
  全エントリ(親・子とも)に一意な `id` が必須である。
  `id` 省略時は登録キーが拡張 ID 単体に潰れ、複数エントリが後勝ちで上書きされる。
  親エントリにも `target` を併記する。
  ガイドは「`id` 指定時 `target` は無視される」と書くが、実機ではサイドバーの active ハイライト挙動に影響した。
  さらに親の `target` を子と同じ pageId にする場合、**子エントリを配列で親より先に置く**。
  上部タブストリップは「そのページを target に持つ最初のエントリ」の `parentId` から兄弟を導出する。
  そのため、親が先だとそのページだけタブが消える。
- `Renderer.K8sApi` の KubeObjectStore を自前ページから使う場合、namespaced リソースの `loadAll()` は **FreeLens 上部の名前空間フィルタ選択に従う**(`contextNamespaces` 既定)。
  全件が要るなら `namespaceStore` から全名前空間を取り `loadAll({ namespaces })` で明示する。
  cluster-scoped リソース(Node / PV 等)はこの影響を受けない。
- `clusterPages[].components.Page` に `observer()` 済みコンポーネントを渡さない。
  ホスト側(`extension-route-registrator`)が再度 `observer()` を適用するため mobx-react-lite が throw する。
  **自拡張の登録中断に加え他拡張のサイドバー項目まで消える**(v1.8.0〜1.10.3 の core 実装で確認)。
  ページ内部の子コンポーネントの `observer()` は問題ない。
