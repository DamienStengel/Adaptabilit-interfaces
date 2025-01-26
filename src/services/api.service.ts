import axios from 'axios';

const API_URL = 'http://localhost:3010';

export interface ProductDTO {
  id: number;
  displayId?: string;
  fullName: string;
  shortName: string;
  price: number;
  category: 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE';
  subcategory: string;
  image: string;
  backendId: string;
}

export const fetchProducts = async (): Promise<ProductDTO[]> => {
  try {
    const response = await axios.get<ProductDTO[]>(`${API_URL}/products`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return [];
  }
};

export const updateProductSubcategory = async (productId: number, newSubcategory: string): Promise<ProductDTO> => {
  try {
    const response = await axios.put<ProductDTO>(`${API_URL}/products/${productId}/subcategory`, {
      newSubcategory
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la sous-catégorie:', error);
    throw error;
  }
};

export const updateProduct = async (product: ProductDTO): Promise<ProductDTO> => {
  try {
    const response = await axios.put<ProductDTO>(`${API_URL}/products`, product);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    throw error;
  }
}; 