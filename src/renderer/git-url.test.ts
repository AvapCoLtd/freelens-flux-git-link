import { describe, expect, it } from "vitest";
import { toWebUrl } from "./git-url";

describe("toWebUrl", () => {
  it("converts a plain https URL, stripping the .git suffix", () => {
    expect(toWebUrl("https://gitlab.example.com/group/repo.git")).toBe("https://gitlab.example.com/group/repo");
  });

  it("converts a plain https URL without a .git suffix unchanged", () => {
    expect(toWebUrl("https://gitlab.example.com/group/repo")).toBe("https://gitlab.example.com/group/repo");
  });

  it("strips a trailing slash", () => {
    expect(toWebUrl("https://gitlab.example.com/group/repo/")).toBe("https://gitlab.example.com/group/repo");
  });

  it("strips userinfo (credentials) from an https URL", () => {
    expect(toWebUrl("https://user:token@gitlab.example.com/group/repo.git")).toBe(
      "https://gitlab.example.com/group/repo",
    );
  });

  it("normalizes an uppercase scheme", () => {
    expect(toWebUrl("HTTPS://gitlab.example.com/group/repo")).toBe("https://gitlab.example.com/group/repo");
  });

  it("keeps the http scheme as-is", () => {
    expect(toWebUrl("http://gitlab.example.com/group/repo.git")).toBe("http://gitlab.example.com/group/repo");
  });

  it("converts ssh:// with an explicit port, dropping the port", () => {
    expect(toWebUrl("ssh://git@gitlab.example.com:22/group/repo.git")).toBe("https://gitlab.example.com/group/repo");
  });

  it("converts ssh:// without a port", () => {
    expect(toWebUrl("ssh://git@gitlab.example.com/group/repo.git")).toBe("https://gitlab.example.com/group/repo");
  });

  it("converts scp-like syntax (git@host:path)", () => {
    expect(toWebUrl("git@gitlab.example.com:group/repo.git")).toBe("https://gitlab.example.com/group/repo");
  });

  it("converts scp-like syntax with an absolute path, avoiding a double slash", () => {
    expect(toWebUrl("git@example.com:/abs/path.git")).toBe("https://example.com/abs/path");
  });

  it("converts the git:// protocol", () => {
    expect(toWebUrl("git://gitlab.example.com/group/repo.git")).toBe("https://gitlab.example.com/group/repo");
  });

  it("returns null for oci:// URLs", () => {
    expect(toWebUrl("oci://ghcr.io/org/repo")).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(toWebUrl(undefined)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(toWebUrl("")).toBeNull();
  });

  it("returns null for plain garbage", () => {
    expect(toWebUrl("this is not a git url")).toBeNull();
  });

  it("returns null for a malformed URL", () => {
    expect(toWebUrl("https://")).toBeNull();
  });
});
