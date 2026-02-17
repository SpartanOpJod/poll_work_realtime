export function getClientIp(headers: Headers) {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const [firstIp] = forwarded.split(',');
    if (firstIp && firstIp.trim()) {
      return firstIp.trim();
    }
  }

  const realIp = headers.get('x-real-ip');
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  return 'unknown-ip';
}
