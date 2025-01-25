import { useState, useEffect } from 'react';
import axios from 'axios';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { FaPlus } from 'react-icons/fa';
import './SubcategoryManager.scss';

interface Product {
    id: string;
    fullName: string;
    shortName: string;
    price: number;
    category: 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE';
    subcategory: string;
    image: string;
}

const API_URL = 'http://localhost:3010';

const SubcategoryManager = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [subcategories, setSubcategories] = useState<string[]>(['Non catégorisé']);
    const [newSubcategory, setNewSubcategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get<Product[]>(`${API_URL}/products`);
            setProducts(response.data);

            const uniqueSubcategories = ['Non catégorisé', ...new Set(response.data.map(p => p.subcategory).filter(Boolean))];
            setSubcategories(uniqueSubcategories);
        } catch (err) {
            setError('Erreur lors du chargement des produits');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const productId = active.id as string;
        const newSubcategory = over.id === 'Non catégorisé' ? '' : over.id.toString();

        try {
            await axios.put(`${API_URL}/products/${productId}/subcategory`, { newSubcategory });
            setProducts(prev => prev.map(p =>
                p.id === productId ? { ...p, subcategory: newSubcategory } : p
            ));
        } catch (err) {
            console.error('Error updating subcategory:', err);
        }
    };

    const addSubcategory = () => {
        if (!newSubcategory.trim()) return;
        setSubcategories(prev => [...prev, newSubcategory]);
        setNewSubcategory('');
    };

    const removeSubcategory = (subcategory: string) => {
        if (subcategory === 'Non catégorisé') return;
        setSubcategories(prev => prev.filter(s => s !== subcategory));
        setProducts(prev => prev.map(p =>
            p.subcategory === subcategory ? { ...p, subcategory: '' } : p
        ));
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="loading-spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-container">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchProducts} className="retry-button">
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">Gestion des sous-catégories</h1>
                <div className="add-category-form">
                    <input
                        type="text"
                        className="add-category-input"
                        value={newSubcategory}
                        onChange={(e) => setNewSubcategory(e.target.value)}
                        placeholder="Nouvelle sous-catégorie"
                    />
                    <button onClick={addSubcategory} className="add-category-button">
                        <FaPlus />
                        <span>Ajouter</span>
                    </button>
                </div>
            </div>

            <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                <div className="admin-grid">
                    {subcategories.map(subcategory => {
                        const subcategoryProducts = products.filter(p =>
                            (subcategory === 'Non catégorisé' && !p.subcategory) ||
                            p.subcategory === subcategory
                        );

                        return (
                            <div key={subcategory} className="category-card">
                                <div className="category-header">
                                    <div className="category-title">
                                        <span>{subcategory}</span>
                                        <span className="category-count">
                      ({subcategoryProducts.length})
                    </span>
                                    </div>
                                    {subcategory !== 'Non catégorisé' && (
                                        <button
                                            onClick={() => removeSubcategory(subcategory)}
                                            className="delete-category-button"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                <div className="category-content">
                                    <SortableContext
                                        items={subcategoryProducts.map(p => p.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {subcategoryProducts.map((product) => (
                                            <SortableItem key={product.id} id={product.id}>
                                                <div className="product-item">
                                                    <div className="product-name">{product.fullName}</div>
                                                    <div className="product-meta">
                                                        {product.category} • {product.id}
                                                    </div>
                                                </div>
                                            </SortableItem>
                                        ))}
                                        {subcategoryProducts.length === 0 && (
                                            <div className="empty-category">
                                                Déposez des produits ici
                                            </div>
                                        )}
                                    </SortableContext>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </DndContext>
        </div>
    );
};

export default SubcategoryManager;