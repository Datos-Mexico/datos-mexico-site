export const colors = {
  background: '#FAFAF9',
  foreground: '#0A0A0A',
  muted: '#F5F5F4',
  mutedForeground: '#57534E',
  border: '#E7E5E4',

  text: '#1F2937',
  textSubtle: '#4B5563',
  textInverse: '#FAFAF9',

  primary: '#15803D',
  primaryHover: '#166534',
  primaryForeground: '#FAFAF9',

  accent: '#B45309',
  accentForeground: '#FAFAF9',

  success: '#15803D',
  warning: '#CA8A04',
  danger: '#B91C1C',
  info: '#1E40AF',
} as const;

export const typography = {
  display: { mobile: { size: '36px', lh: '1.1' }, desktop: { size: '64px', lh: '1.05' }, family: 'serif' },
  h1: { mobile: { size: '32px', lh: '1.15' }, desktop: { size: '48px', lh: '1.1' }, family: 'serif' },
  h2: { mobile: { size: '26px', lh: '1.2' }, desktop: { size: '36px', lh: '1.2' }, family: 'serif' },
  h3: { mobile: { size: '22px', lh: '1.3' }, desktop: { size: '24px', lh: '1.3' }, family: 'serif' },
  lead: { mobile: { size: '18px', lh: '1.5' }, desktop: { size: '20px', lh: '1.5' }, family: 'sans' },
  body: { mobile: { size: '16px', lh: '1.6' }, desktop: { size: '17px', lh: '1.65' }, family: 'sans' },
  small: { mobile: { size: '14px', lh: '1.5' }, desktop: { size: '14px', lh: '1.5' }, family: 'sans' },
  mono: { mobile: { size: '14px', lh: '1.5' }, desktop: { size: '14px', lh: '1.5' }, family: 'mono' },
} as const;

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export const navigation: readonly NavItem[] = [
  { label: 'Observatorio', href: 'https://datos-itam.org', external: true },
  { label: 'Publicaciones', href: '/publicaciones' },
  { label: 'Agenda', href: '/agenda' },
  { label: 'Metodología', href: '/metodologia' },
  { label: 'Prensa', href: '/prensa' },
  { label: 'Quiénes Somos', href: '/quienes-somos' },
  { label: 'Contacto', href: '/contacto' },
];

export const brand = {
  name: 'Datos México',
  domain: 'datosmexico.org',
  tagline: 'Observatorio de datos de México: del microdato a la conversación pública.',
  shortTagline: 'Observatorio académico independiente.',
} as const;
