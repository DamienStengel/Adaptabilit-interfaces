import { ProductDTO } from './api.service';
import axios from 'axios';

const API_URL = 'http://localhost:3010';

export interface Product extends ProductDTO {}

const CATEGORY_PREFIXES = {
  'STARTER': 'E', // Entrées
  'MAIN': 'P',    // Plats
  'DESSERT': 'D', // Desserts
  'BEVERAGE': 'B' // Boissons
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get<Product[]>(`${API_URL}/products`);
    return assignSequentialIds(response.data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

const assignSequentialIds = (products: Product[]): Product[] => {
  // Grouper les produits par catégorie
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Assigner des IDs séquentiels pour chaque catégorie
  return products.map(product => {
    const categoryProducts = productsByCategory[product.category];
    const indexInCategory = categoryProducts.indexOf(product);
    const prefix = CATEGORY_PREFIXES[product.category];
    const sequentialId = indexInCategory + 1;
    
    return {
      ...product,
      displayId: `${prefix}${sequentialId}`, // Ajouter un displayId pour l'affichage
      id: product.id // Garder l'ID original pour les opérations backend
    };
  });
};

export const getCategoryCode = (category: string): string => {
  switch (category) {
    case 'STARTER': return 'ENTREE';
    case 'MAIN': return 'PLAT';
    case 'DESSERT': return 'DESSERT';
    case 'BEVERAGE': return 'BOISSON';
    default: return category;
  }
};

export const transformAndSortProducts = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => {
    // Trier d'abord par catégorie selon un ordre spécifique
    const categoryOrder = {
      'STARTER': 1,
      'MAIN': 2,
      'DESSERT': 3,
      'BEVERAGE': 4
    };
    
    const categoryDiff = categoryOrder[a.category] - categoryOrder[b.category];
    if (categoryDiff !== 0) return categoryDiff;
    
    // Ensuite trier par displayId numérique
    const aNum = parseInt(a.displayId?.slice(1) || '0');
    const bNum = parseInt(b.displayId?.slice(1) || '0');
    return aNum - bNum;
  });
};

export const updateProductSubcategory = async (productId: number, newSubcategory: string): Promise<Product> => {
  try {
    const response = await axios.put(`${API_URL}/products/${productId}/subcategory`, {
      newSubcategory
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product subcategory:', error);
    throw error;
  }
};