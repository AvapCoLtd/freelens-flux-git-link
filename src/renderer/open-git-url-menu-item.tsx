import { Common, Renderer } from "@freelensapp/extensions";
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
    // window.openはElectronのBrowserWindow内遷移になり得るため、既定ブラウザで開くCommon.Util.openExternalを使う。
    Common.Util.openExternal(webUrl).catch((error: unknown) =>
      console.error("[freelens-flux-git-link] openExternal failed", error),
    );
  };

  return (
    <Renderer.Component.MenuItem onClick={handleClick}>
      <Renderer.Component.Icon material="open_in_new" interactive={toolbar} tooltip="Open Git URL" />
      <span className="title">Open Git URL</span>
    </Renderer.Component.MenuItem>
  );
}
