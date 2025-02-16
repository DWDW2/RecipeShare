const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  recipes: {
    list: `${API_BASE_URL}/recipes`,
    detail: (id: string) => `${API_BASE_URL}/recipes/${id}`,
    create: `${API_BASE_URL}/recipes`,
    update: (id: string) => `${API_BASE_URL}/recipes/${id}`,
    delete: (id: string) => `${API_BASE_URL}/recipes/${id}`,
  },
} as const; 