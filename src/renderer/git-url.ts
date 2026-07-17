// スキーム付き(scheme://)入力かどうかの判定。scp風構文(git@host:path)にはスキームが無いため、
// これに一致しない入力だけを SCP_LIKE_RE で試す。
const URL_SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//;
const SCP_LIKE_RE = /^(?:[^@\s]+@)?([^:\s/]+):(.+)$/;

function stripGitSuffix(path: string): string {
  return path.replace(/\/+$/, "").replace(/\.git$/i, "");
}

/**
 * git のリモート URL(https/http/ssh/git スキーム、または scp 風構文)を
 * ブラウザで開ける https(またはhttp) URL に変換する。非対応スキーム・空・不正な値は null。
 */
export function toWebUrl(url: string | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  let normalized = trimmed;
  if (!URL_SCHEME_RE.test(trimmed)) {
    const scpMatch = trimmed.match(SCP_LIKE_RE);
    if (!scpMatch) return null;
    const [, host, path] = scpMatch;
    // path が "/" 始まりでも二重スラッシュにしないよう、ここで剥がしてから合流させる。
    normalized = `ssh://${host}/${path.replace(/^\/+/, "")}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return null;
  }

  // URL.protocol は常に小文字へ正規化されるため、大文字スキーム入力を別途ケアする必要はない。
  switch (parsed.protocol) {
    case "https:":
    case "http:":
      // URL.host は userinfo(user:pass@) を含まない: 資格情報をブラウザ URL へ漏らさないための手動 strip は不要。
      return `${parsed.protocol}//${parsed.host}${stripGitSuffix(parsed.pathname)}`;
    case "ssh:":
    case "git:":
      // ssh のポート番号はブラウザで開く URL には不要なため hostname(ポートを含まない)を使う。
      return `https://${parsed.hostname}${stripGitSuffix(parsed.pathname)}`;
    default:
      return null;
  }
}
