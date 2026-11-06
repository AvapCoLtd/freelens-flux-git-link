import { Renderer } from "@freelensapp/extensions";
import { GitRepository } from "./git-repository";
import { OpenGitUrlMenuItem } from "./open-git-url-menu-item";

export default class FluxGitLinkRenderer extends Renderer.LensExtension {
  kubeObjectMenuItems = [Renderer.K8sApi.menuItemFor(GitRepository, { MenuItem: OpenGitUrlMenuItem })];
}
