import axios from 'axios';

const API_URL = 'http://localhost:3010';

export interface Product {
    id: string;
    fullName: string;
    shortName: string;
    price: number;
    category: 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE';
    subcategory: string;
    image: string;
}

export const getProducts = async (): Promise<Product[]> => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
};

export const getCategoryCode = (category: string): string => {
    switch (category) {
        case 'STARTER': return 'ENTREE';
        case 'MAIN': return 'PLAT';
        case 'DESSERT': return 'DESSERT';
        case 'BEVERAGE': return 'BOISSON';
        default: return 'TOUT';
    }
};

export const generateSequentialId = (category: string, index: number): string => {
    const prefix = category.charAt(0);
    return `${prefix}${index + 1}`;
};

export const transformAndSortProducts = (products: Product[]) => {
    const categorizedProducts = {
        ENTREE: products.filter(p => p.category === 'STARTER'),
        PLAT: products.filter(p => p.category === 'MAIN'),
        DESSERT: products.filter(p => p.category === 'DESSERT'),
        BOISSON: products.filter(p => p.category === 'BEVERAGE')
    };

    const transformedProducts = Object.entries(categorizedProducts).flatMap(([category, items]) =>
        items.map((product, index) => ({
            ...product,
            id: generateSequentialId(category, index),
            image: product.image || `https://pixabay.com/get/g${product.id.toLowerCase()}.jpg`
        }))
    );

    return transformedProducts;
};

export const updateProductSubcategory = async (productId: string, newSubcategory: string): Promise<Product> => {
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