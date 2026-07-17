import { Renderer } from "@freelensapp/extensions";
import { OpenGitUrlMenuItem } from "./open-git-url-menu-item";

export default class FluxGitLinkRenderer extends Renderer.LensExtension {
  kubeObjectMenuItems = [
    {
      kind: "GitRepository",
      apiVersions: [
        "source.toolkit.fluxcd.io/v1",
        "source.toolkit.fluxcd.io/v1beta2",
        "source.toolkit.fluxcd.io/v1beta1",
      ],
      components: {
        MenuItem: OpenGitUrlMenuItem,
      },
    },
  ];
}
