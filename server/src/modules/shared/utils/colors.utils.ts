export function getRandomHex() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 100;
  const lightness = 60;
  return hslToHex(hue, saturation, lightness);
}

export function hslToHex(hue: number, saturation: number, lightness: number): string {
  const hexDecimal = lightness / 100;
  const a = (saturation * Math.min(hexDecimal, 1 - hexDecimal)) / 100;
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    const color = hexDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
