import axios from 'axios';

export interface CustomerPayload {
  name: string;
  phone: string;
  email: string;
  address: string;
  cnic: string;
  notes?: string;
  mrNumber?: string;
}

export const customerApi = {
  async getAll() {
    const { data } = await axios.get('/api/customers');
    return data;
  },

  async create(payload: CustomerPayload) {
    const { data } = await axios.post('/api/customers', payload);
    return data;
  },

  async update(id: string, payload: Partial<CustomerPayload>) {
    const { data } = await axios.put(`/api/customers/${id}`, payload);
    return data;
  },

  async remove(id: string) {
    const { data } = await axios.delete(`/api/customers/${id}`);
    return data;
  }
};
