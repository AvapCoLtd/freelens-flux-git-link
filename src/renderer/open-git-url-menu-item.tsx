import { type Common, Renderer } from "@freelensapp/extensions";
import { toWebUrl } from "./git-url";

// KubeObject.spec は必須プロパティ(型は unknown)のため、ここでは required のまま形だけ絞り込む。
// spec ごと optional にすると KubeObjectMenuItemProps<T extends KubeObject> の制約を満たせなくなる。
export interface GitRepositoryObject extends Renderer.K8sApi.KubeObject {
  spec: {
    url?: string;
  };
}

export function OpenGitUrlMenuItem(props: Common.Types.KubeObjectMenuItemProps<GitRepositoryObject>) {
  const { object, toolbar } = props;
  const webUrl = toWebUrl(object.spec?.url);
  if (webUrl === null) return null;

  const handleClick = () => {
    // ホストの window-open ハンドラが新規ウィンドウを拒否し、http/https URL を既定ブラウザへ渡す。
    window.open(webUrl);
  };

  return (
    <Renderer.Component.MenuItem onClick={handleClick}>
      <Renderer.Component.Icon material="open_in_new" interactive={toolbar} tooltip="Open Git URL" />
      <span className="title">Open Git URL</span>
    </Renderer.Component.MenuItem>
  );
}
