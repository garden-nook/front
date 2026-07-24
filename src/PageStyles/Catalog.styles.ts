import type { CSSProperties } from 'react';

export const catalogStyles: { [key: string]: CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    paddingTop: '0px',
  },
  main: {
    padding: '24px 20px 40px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
  },
  searchWrapper: {
    maxWidth: '1000px',
    margin: '0 auto 32px',
    padding: '0 16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '36px',
    padding: '0 16px',
  },
  emptyWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
    width: '100%',
  },
  empty: {
    textAlign: 'center' as const,
    color: '#6B7280',
    fontSize: '18px',
    fontWeight: 500,
    padding: '40px 0',
  },
  loading: {
    textAlign: 'center' as const,
    color: '#6B7280',
    fontSize: '16px',
    padding: '40px 0',
  },
};