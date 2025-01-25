import axios from 'axios';

const API_URL = 'http://localhost:3010';

export interface ProductDTO {
  id: string;
  fullName: string;
  shortName: string;
  price: number;
  category: 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE';
  subcategory: string;
  image: string;
}

export const fetchProducts = async (): Promise<ProductDTO[]> => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return [];
  }
}; 