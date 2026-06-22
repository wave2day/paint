export function median(values){
  const sorted =
    values.sort((a, b) => a - b);

  const mid =
    Math.floor(sorted.length / 2);

  if(sorted.length % 2){
    return sorted[mid];
  }

  return Math.round(
    (sorted[mid - 1] + sorted[mid]) / 2
  );
}

export function getLuma(color){
  return (
    color.r * .2126 +
    color.g * .7152 +
    color.b * .0722
  );
}

export function nearestPaletteColor(color, paletteColors){
  let nearest =
    paletteColors[0];

  let nearestDistance =
    Infinity;

  paletteColors.forEach(candidate => {
    const dr =
      color.r - candidate.r;

    const dg =
      color.g - candidate.g;

    const db =
      color.b - candidate.b;

    const distance =
      dr * dr + dg * dg + db * db;

    if(distance < nearestDistance){
      nearest = candidate;
      nearestDistance = distance;
    }
  });

  return nearest;
}

export function mixRgb(color, target, amount){
  return {
    r:Math.round(color.r + (target.r - color.r) * amount),
    g:Math.round(color.g + (target.g - color.g) * amount),
    b:Math.round(color.b + (target.b - color.b) * amount),
    a:color.a
  };
}

export function colorToCss(color){
  return color.a >= 255
    ? `rgb(${color.r},${color.g},${color.b})`
    : `rgba(${color.r},${color.g},${color.b},${(color.a / 255).toFixed(3)})`;
}

export function hexToRgb(hex){
  const clean =
    hex.replace("#", "");

  return {
    r:parseInt(clean.slice(0, 2), 16),
    g:parseInt(clean.slice(2, 4), 16),
    b:parseInt(clean.slice(4, 6), 16),
    a:255
  };
}
