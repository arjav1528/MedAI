export const debugAuth = async () => {
  try {
    const response = await fetch('/api/debug-auth');
    const data = await response.json();
    console.log('Auth debug data:', data);
    return data;
  } catch (error) {
    console.error('Auth debug error:', error);
    return null;
  }
};