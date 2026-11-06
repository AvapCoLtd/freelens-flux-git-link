---
last_verified: 2026-11-06
---

# FreeLens 拡張 API の情報源

FreeLens拡張開発で参照すべき情報源へのポインタ集。
陳腐化を避けるため、ここには内容を転記せずリンク先を一次情報として参照すること。
リンク切れ・記述齟齬を見つけたら本ファイルを更新する(frontmatterの `last_verified` も併せて更新)。

## 一次情報(FreeLens 公式)

| 情報源 | URL | 何がわかるか |
|---|---|---|
| FreeLens 公式ドキュメント | <https://freelensapp.github.io/docs/> | 拡張の全体像。拡張クラス(v2 では `Renderer.LensExtension` / `Main.LensExtension`)、`globalPages` / `clusterPages` 等の登録ポイント |
| freelensapp/freelens(本体リポジトリ) | <https://github.com/freelensapp/freelens> | 実装の最終的な真実。API の挙動が不明なときはここを読む |
| freelens 本体 Wiki: Extensions | <https://github.com/freelensapp/freelens/wiki/Extensions> | 拡張の配布・インストール周りの運用情報 |
| freelensapp/freelens-example-extension | <https://github.com/freelensapp/freelens-example-extension> | 公式サンプル。clusterPages でのカスタムページ実装例 |
| freelensapp/freelens-fluxcd-extension | <https://github.com/freelensapp/freelens-fluxcd-extension> | 公式 FluxCD 拡張。`GitRepository` 等 FluxCD リソースのページ登録の実例 |
| FreeLens v2 移行ガイド | <https://github.com/freelensapp/freelens/blob/v2.0.0/docs/extensions/migrating-from-v1.md> | v1 拡張を v2 へ移す際の必須変更。削除・改名された API の対応表(v1→v2 rename table)もここにある |
| FreeLens 拡張 API リファレンス | <https://github.com/freelensapp/freelens/blob/main/docs/extensions/api.md> | v2 の公開 API の仕様。`menuItemFor` / `detailsFor` と、モデルクラス(`LensExtensionKubeObject` のサブクラス)の書き方もここにある |
| npm: `@freelensapp/extensions` | <https://www.npmjs.com/package/@freelensapp/extensions> | 拡張が依存する公開 API パッケージ。v2 では `globalThis.FreelensExtensionApi` を読むだけの shim と、単一の型定義 `dist/extension-api.d.ts` からなる。型定義がそのまま API リファレンスになる |
| npm: `@freelensapp/legacy-extensions` | <https://www.npmjs.com/package/@freelensapp/legacy-extensions> | 旧 Lens (OpenLens) 拡張 API との互換レイヤ |

## 補助情報(旧 Lens / upstream)

FreeLensはOpenLensのfork。
拡張の概念モデル(main/rendererの2プロセス構成、IPC、各種Registration)は旧Lensのドキュメントがそのまま概ね通用する。
記述がFreeLensの現状と食い違う場合は上の一次情報を優先する。

| 情報源 | URL | 何がわかるか |
|---|---|---|
| Lens Extension API docs | <https://api-docs.k8slens.dev/> | ガイドが体系的。Extension Anatomy / Main Extension / Renderer Extension / IPC(`broadcast` / `invoke` / `listen` / `handle`)の解説 |

## 実例

外部ドキュメントより先に、まず動いている実例として本リポジトリの `src` を読むこと。

- freelens-flux-git-link(本リポジトリ、[README](../README.md)):
  `menuItemFor` とモデルクラスによる `kubeObjectMenuItems` 登録(`kind`+`apiVersions` によるマッチング)+ `window.open` によるブラウザ起動の使用例(FreeLens 2.0対応済み)。
  [docs/design.md](design.md)にgit remote URL変換規則やモデルクラスの型まわりの設計判断の記録あり
- [freelens-oci-cluster](https://github.com/AvapCoLtd/freelens-oci-cluster):
  `clusterPageMenus` 登録 + `node:child_process`(`execFile`)による外部CLI呼び出しの使用例。
  `Renderer.K8sApi` のKubeObjectStore(`nodesStore` / `serviceStore` / `persistentVolumeStore` 等)使用例。
  `Common.Util.openExternal` を使うボタン実装(`console-button.tsx`)の先行実例でもある。
  ただしFreeLens 1.x向けの実装で、`openExternal` とrendererからのNode利用はv2では使えない
- [freelens-cluster-sidebar](https://github.com/AvapCoLtd/freelens-cluster-sidebar):
  `topBarItems` 登録 + `ReactDOM.createPortal` による常駐UI、`Renderer.Catalog` の使用例
- [freelens-locale-ja](https://github.com/AvapCoLtd/freelens-locale-ja):
  公式登録APIを使わない実行時パッチ方式の例。
  `src/renderer/collector.ts` はrendererコードから `node:fs` を直接importして使う実例
- ビルド枠組み(Viteをrenderer用・main用の2回実行し、どちらもESMで出力する。host提供ライブラリは `globalThis.FreelensExtensionApi` へ置き換える)は `vite.config.mjs` と `build/vite-plugin-host-modules.mjs` に記載

## 型定義 = API リファレンス

公開APIの正確な形は型定義を直接読むのが確実。
v2では `node_modules/@freelensapp/extensions/dist/extension-api.d.ts` の1ファイルに全名前空間がまとまっている。

## APIs used(このプラグインが使う API)

- `Renderer.LensExtension.kubeObjectMenuItems: KubeObjectMenuRegistration[]`。
  `{ kind, apiVersions, components: { MenuItem }, visible? }` の配列を登録する。
- `Renderer.K8sApi.menuItemFor(kubeObjectClass, { MenuItem })`: モデルクラスのstatic `kind` と `crd.apiVersions` から上の登録を作る。
  `MenuItem` のpropsがモデルクラスに合わないとコンパイルエラーになる。
- `Renderer.K8sApi.LensExtensionKubeObject`: モデルクラス `GitRepository` の基底クラス。
  型引数で `spec` の型を指定する。
- 個々の `MenuItem` コンポーネントが受け取るpropsの型は `Common.Types.KubeObjectMenuItemProps<T extends KubeObject>`(`{ object: T; toolbar?: boolean }`)。
  `Common.Types` 名前空間からエクスポートされる。
  似た名前の `Renderer.Component.KubeObjectMenuProps` はhost側の `<KubeObjectMenu>` 本体(`id` / `editable` / `removable` / `onMenuReady` を持つ、より大きい型)である。
  個々の `MenuItem` のpropsとは別物なので注意。
- `window.open(url)`(renderer): 既定ブラウザでURLを開く。
  ホストのwindow-openハンドラが新規ウィンドウを拒否し、URLを既定ブラウザへ渡す。
  FreeLens 2.0.0の `app.asar` 内 `static/build/main.js` の `setWindowOpenHandler` で確認した。
  v1の `Common.Util.openExternal` はv2で削除された。
- `Renderer.Component.MenuItem` / `Renderer.Component.Icon`: メニュー項目本体とアイコン描画。

### 検証済みの挙動(実機・型定義で確認)

- `kubeObjectMenuItems` は `kind`+`apiVersions` の組でグローバルに集約される。
  ページ側(組み込みのCustom Resourcesページ、公式FluxCD拡張のページ)ごとに別registrationは不要である。
  単一の登録が両方に反映される。
- 表示先は2箇所: オブジェクト詳細ドロワーの上部ツールバー(アイコンのみ)と、一覧ページの行「⋮」メニュー(アイコン+テキスト)。
  ツールバーモードでアイコンのみになるのはhost側CSSの `.MenuActions.toolbar .title{display:none}` によるもの(`renderer.css` で確認)。コンポーネント側で `toolbar` propを見て `<span className="title">` の出し分けをする必要はない。
- `menuItemFor(GitRepository, { MenuItem })` に `KubeObjectMenuItemProps<Pod>` を受けるコンポーネントを渡すと、tscがエラーにする(手元のtscで確認)。
  モデルクラスの `declare kind` / `declare apiVersion` はビルド出力に残らない(`out/renderer/index.js` で確認)。

## 要点(ポインタの読み方)

- 拡張はrenderer(UI・React)とmain(Electron mainプロセス)の2エントリポイント構成。
  独立ページ追加はrenderer側の `globalPages` / `clusterPages`(`PageRegistration[]`)に登録する。
- FreeLens 2.0のrendererにはNode / Electronの保証がない(`require()` も含む)。
  rendererエントリはESMとしてブラウザ向けにビルドする。
  Nodeが要る処理はmainに置き、IPC(`broadcast`/`invoke`/`listen`/`handle`)で呼ぶ。
  1.xではrendererから `node:child_process` 等を直接使えたが、その前提はv2では成り立たない。
- `clusterPageMenus` は上流Lensの公式ガイド例より**公式FluxCD拡張の実装を正とする**(<https://github.com/freelensapp/freelens-fluxcd-extension>)。
  実機で確認した差異が2件ある。
  全エントリ(親・子とも)に一意な `id` が必須である。
  `id` 省略時は登録キーが拡張ID単体に潰れ、複数エントリが後勝ちで上書きされる。
  親エントリにも `target` を併記する。
  ガイドは「`id` 指定時 `target` は無視される」と書くが、実機ではサイドバーのactiveハイライト挙動に影響した。
  さらに親の `target` を子と同じpageIdにする場合、**子エントリを配列で親より先に置く**。
  上部タブストリップは「そのページをtargetに持つ最初のエントリ」の `parentId` から兄弟を導出する。
  そのため、親が先だとそのページだけタブが消える。
- `Renderer.K8sApi` のKubeObjectStoreを自前ページから使う場合、namespacedリソースの `loadAll()` は**FreeLens上部の名前空間フィルタ選択に従う**(`contextNamespaces` 既定)。
  全件が要るなら `namespaceStore` から全名前空間を取り `loadAll({ namespaces })` で明示する。
  cluster-scopedリソース(Node / PV等)はこの影響を受けない。
- `clusterPages[].components.Page` に `observer()` 済みコンポーネントを渡さない。
  ホスト側(`extension-route-registrator`)が再度 `observer()` を適用するためmobx-react-liteがthrowする。
  **自拡張の登録中断に加え他拡張のサイドバー項目まで消える**(v1.8.0〜1.10.3のcore実装で確認)。
  ページ内部の子コンポーネントの `observer()` は問題ない。
