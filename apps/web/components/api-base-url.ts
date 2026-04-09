const explicitApiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  "";

function isPrivateOrLoopbackHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function shouldUseBackendProxy() {
  if (!explicitApiBaseUrl) {
    return true;
  }

  if (explicitApiBaseUrl.startsWith("/")) {
    return false;
  }

  try {
    const targetUrl = new URL(explicitApiBaseUrl);
    return isPrivateOrLoopbackHost(targetUrl.hostname);
  } catch {
    return true;
  }
}

const configuredApiBaseUrl = shouldUseBackendProxy() ? "/backend" : explicitApiBaseUrl;

export const apiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");
