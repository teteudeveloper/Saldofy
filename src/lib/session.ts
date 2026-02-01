function toBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "")
  }

  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  // eslint-disable-next-line no-undef
  const b64 = btoa(binary)
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function fromBase64Url(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/")
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4)

  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(padded, "base64"))
  }

  // eslint-disable-next-line no-undef
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  )
  return new Uint8Array(signature)
}

export async function signValue(payloadJson: string, secret: string): Promise<string> {
  const payloadBytes = new TextEncoder().encode(payloadJson)
  const payloadB64Url = toBase64Url(payloadBytes)
  const sigBytes = await hmacSha256(secret, payloadB64Url)
  const sigB64Url = toBase64Url(sigBytes)
  return `${payloadB64Url}.${sigB64Url}`
}

export async function verifyValue(
  signedValue: string,
  secret: string
): Promise<{ valid: false } | { valid: true; payloadJson: string }> {
  const [payloadB64Url, sigB64Url, ...rest] = signedValue.split(".")
  if (!payloadB64Url || !sigB64Url || rest.length > 0) return { valid: false }

  const expectedSigBytes = await hmacSha256(secret, payloadB64Url)
  const actualSigBytes = fromBase64Url(sigB64Url)

  if (expectedSigBytes.length !== actualSigBytes.length) return { valid: false }

  let diff = 0
  for (let i = 0; i < expectedSigBytes.length; i++) {
    diff |= expectedSigBytes[i] ^ actualSigBytes[i]
  }
  if (diff !== 0) return { valid: false }

  const payloadBytes = fromBase64Url(payloadB64Url)
  const payloadJson = new TextDecoder().decode(payloadBytes)
  return { valid: true, payloadJson }
}

