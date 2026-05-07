export const SCHOOL_NAME = import.meta.env.VITE_SCHOOL_NAME || localStorage.getItem('school_name') || 'PKBM Armilla Nusa';

export const getSchoolParts = () => {
  const parts = SCHOOL_NAME.split(' ');
  return {
    first: parts[0] || 'PKBM',
    rest: parts.slice(1).join(' ') || 'Armilla Nusa'
  };
};
