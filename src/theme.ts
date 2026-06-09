export const theme = {
  primaryDark: '#2c3e50',
  secondaryDark: '#34495e',
  green: '#27ae60',
  greenDark: '#1e8449',
  red: '#e74c3c',
  redDark: '#c0392b',
  blue: '#3498db',
  blueDark: '#2980b9',
  orange: '#e67e22',
  orangeDark: '#d35400',
  bg: '#ecf0f1',
  bgDark: '#bdc3c7',
  white: '#ffffff',
  textDark: '#2c3e50',
  textLight: '#7f8c8d',
  border: '#bdc3c7',
  shadow: '0 2px 8px rgba(0,0,0,0.12)',
  shadowHover: '0 4px 16px rgba(0,0,0,0.18)',
  radius: 8,
  radiusSm: 5,
  radiusLg: 10,
  transition: 'all 0.3s ease',
};

export const cardStyle: React.CSSProperties = {
  backgroundColor: theme.white,
  borderRadius: theme.radiusLg,
  padding: 15,
  boxShadow: theme.shadow,
  transition: theme.transition,
};

export const btnStyle = (bg: string, hoverBg?: string): React.CSSProperties => ({
  backgroundColor: bg,
  color: theme.white,
  border: 'none',
  borderRadius: theme.radiusSm,
  padding: '7px 14px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  transition: theme.transition,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
});

export const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: theme.radiusSm,
  border: `1.5px solid ${theme.border}`,
  fontSize: 13,
  color: theme.textDark,
  backgroundColor: theme.white,
  outline: 'none',
  transition: theme.transition,
  boxSizing: 'border-box',
};

export const topBarStyle: React.CSSProperties = {
  backgroundColor: theme.primaryDark,
  padding: '14px 25px',
  display: 'flex',
  alignItems: 'center',
  gap: 20,
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
};

export const bottomBarStyle: React.CSSProperties = {
  backgroundColor: theme.bgDark,
  padding: '5px 20px',
  display: 'flex',
  alignItems: 'center',
  fontSize: 11,
  color: theme.textDark,
};
