import axios from 'axios';

export const getMedicines = async () => {
  const res = await axios.get('/api/medicines');
  return res.data;
};
