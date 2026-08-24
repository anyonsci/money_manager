import moneyManagerPreset from '../index.js';

describe('Tailwind Preset', () => {
  it('exports preset configuration object with content array', () => {
    expect(moneyManagerPreset).toBeDefined();
    expect(Array.isArray(moneyManagerPreset.content)).toBe(true);
    expect(moneyManagerPreset.content).toContain('../../packages/ui/src/**/*.{js,ts,jsx,tsx}');
    expect(moneyManagerPreset.content).toContain('../../packages/core/src/**/*.{js,ts,jsx,tsx}');
  });

  it('defines custom brand color palette (50-950)', () => {
    const brand = moneyManagerPreset.theme?.extend?.colors?.brand;
    expect(brand).toBeDefined();
    expect(brand[50]).toBe('#eef2ff');
    expect(brand[100]).toBe('#e0e7ff');
    expect(brand[200]).toBe('#c7d2fe');
    expect(brand[300]).toBe('#a5b4fc');
    expect(brand[400]).toBe('#818cf8');
    expect(brand[500]).toBe('#6366f1');
    expect(brand[600]).toBe('#4f46e5');
    expect(brand[700]).toBe('#4338ca');
    expect(brand[800]).toBe('#3730a3');
    expect(brand[900]).toBe('#312e81');
    expect(brand[950]).toBe('#1e1b4b');
  });

  it('defines custom slate shades (925, 950)', () => {
    const slate = moneyManagerPreset.theme?.extend?.colors?.slate;
    expect(slate).toBeDefined();
    expect(slate[925]).toBe('#090d16');
    expect(slate[950]).toBe('#020617');
  });

  it('defines custom box shadows', () => {
    const boxShadow = moneyManagerPreset.theme?.extend?.boxShadow;
    expect(boxShadow).toBeDefined();
    expect(boxShadow.soft).toBe('0 20px 45px -24px rgba(15, 23, 42, 0.35)');
    expect(boxShadow.glow).toBe('0 0 25px -5px rgba(99, 102, 241, 0.25)');
  });

  it('defines sans font family with Inter first', () => {
    const sans = moneyManagerPreset.theme?.extend?.fontFamily?.sans;
    expect(Array.isArray(sans)).toBe(true);
    expect(sans?.[0]).toBe('Inter');
  });
});
