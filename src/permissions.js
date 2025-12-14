export function featuresForPackage(pkg) {
  const p = String(pkg || "starter").toLowerCase();

  if (p === "scale") {
    return {
      canUseLabels: true,
      canUseMarketplaces: true,
      canUseDecoderAdvanced: true,
      maxUsers: 999
    };
  }

  if (p === "growth") {
    return {
      canUseLabels: true,
      canUseMarketplaces: true,
      canUseDecoderAdvanced: false,
      maxUsers: 10
    };
  }

  return {
    canUseLabels: false,
    canUseMarketplaces: false,
    canUseDecoderAdvanced: false,
    maxUsers: 2
  };
}
