export function featuresForPackage(packageName) {
  const pkg = packageName || "starter";

  // Basis: iedereen heeft products + search
  const base = {
    canUseProducts: true,
    canUseSearch: true,
    canUseLabels: false,
    canUseMultiUsers: false,
    maxUsers: 1,
    maxWarehouses: 1,
    canUseMarketplaces: false,
    canUseApi: false,
  };

  if (pkg === "starter") return base;

  if (pkg === "growth") {
    return {
      ...base,
      canUseLabels: true,
      canUseMultiUsers: true,
      maxUsers: 10,
      maxWarehouses: 3,
      canUseMarketplaces: true,
      canUseApi: false,
    };
  }

  // scale
  return {
    ...base,
    canUseLabels: true,
    canUseMultiUsers: true,
    maxUsers: 999,
    maxWarehouses: 999,
    canUseMarketplaces: true,
    canUseApi: true,
  };
}
