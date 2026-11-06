import { type Common, Renderer } from "@freelensapp/extensions";
import type { GitRepository } from "./git-repository";
import { toWebUrl } from "./git-url";

export function OpenGitUrlMenuItem(props: Common.Types.KubeObjectMenuItemProps<GitRepository>) {
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
