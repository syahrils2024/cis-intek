export function proxyMapper(alias = null) {
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (alias) return `${alias}.${prop.toString()}`;
        return prop.toString();
      },
    }
  );
}
