import { Renderer } from "@freelensapp/extensions";

export interface GitRepositorySpec {
  url?: string;
}

export class GitRepository extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.NamespaceScopedMetadata,
  unknown,
  GitRepositorySpec
> {
  // declare は static の kind・crd.apiVersions と同じ値に揃える。
  // 外すと menuItemFor が別 kind 用のコンポーネントを型エラーにできなくなる。
  declare kind: "GitRepository";
  declare apiVersion:
    | "source.toolkit.fluxcd.io/v1"
    | "source.toolkit.fluxcd.io/v1beta2"
    | "source.toolkit.fluxcd.io/v1beta1";

  static readonly kind = "GitRepository";
  static readonly namespaced = true;
  static readonly crd = {
    apiVersions: [
      "source.toolkit.fluxcd.io/v1",
      "source.toolkit.fluxcd.io/v1beta2",
      "source.toolkit.fluxcd.io/v1beta1",
    ],
    plural: "gitrepositories",
    singular: "gitrepository",
  };
}
