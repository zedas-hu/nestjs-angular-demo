import { isIP } from 'node:net';

export function parseTrustedProxies(value: string | undefined): string[] | false {
  if (value === undefined || value.trim() === '') {
    return false;
  }

  const proxies = value.split(',').map((proxy) => proxy.trim());
  if (proxies.some((proxy) => proxy.length === 0)) {
    throw new Error('TRUSTED_PROXIES must be a comma-separated list of proxy addresses or CIDRs');
  }
  if (
    proxies.some((proxy) => {
      const prefix = proxy.split('/')[1];
      return ['*', 'all'].includes(proxy.toLowerCase()) ||
        (prefix !== undefined && /^\d+$/.test(prefix) && Number(prefix) === 0);
    })
  ) {
    throw new Error('TRUSTED_PROXIES must not contain a wildcard or all-address range');
  }
  if (proxies.some((proxy) => !isIpAddressOrCidr(proxy))) {
    throw new Error('TRUSTED_PROXIES entries must be valid IP addresses or CIDRs');
  }

  return proxies;
}

function isIpAddressOrCidr(value: string): boolean {
  const [address, prefix, ...extra] = value.split('/');
  const version = isIP(address);
  if (version === 0 || extra.length > 0) {
    return false;
  }
  if (prefix === undefined) {
    return true;
  }
  if (!/^\d+$/.test(prefix)) {
    return false;
  }

  return Number(prefix) <= (version === 4 ? 32 : 128);
}
