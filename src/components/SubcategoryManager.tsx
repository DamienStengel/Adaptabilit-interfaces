import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    useSensor,
    useSensors,
    PointerSensor,
    useDroppable,
    DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';
import './SubcategoryManager.scss';
import { useNavigate } from 'react-router-dom';

interface Product {
    id: number;
    fullName: string;
    shortName: string;
    price: number;
    category: 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE';
    subcategory: string;
    image: string;
    backendId: string;
}

const API_URL = 'http://localhost:3010';

const DroppableZone = ({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className={`${className} ${isOver ? 'droppable-active' : ''}`}>
            {children}
        </div>
    );
};

const CategorySelector = ({ activeCategory, onCategoryChange }: { 
    activeCategory: string; 
    onCategoryChange: (category: 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE') => void 
}) => {
    const categories = [
        { id: 'STARTER', label: 'Entrées' },
        { id: 'MAIN', label: 'Plats' },
        { id: 'DESSERT', label: 'Desserts' },
        { id: 'BEVERAGE', label: 'Boissons' }
    ];

    return (
        <div className="category-selector">
            {categories.map(category => (
                <button
                    key={category.id}
                    className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => onCategoryChange(category.id as 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE')}
                >
                    {category.label}
                </button>
            ))}
        </div>
    );
};

const SubcategoryManager = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE'>('STARTER');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [newSubcategory, setNewSubcategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [draggedProduct, setDraggedProduct] = useState<Product | null>(null);
    const navigate = useNavigate();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchProducts();
    }, [activeCategory]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get<Product[]>(`${API_URL}/products`);
            const filteredProducts = response.data.filter(p => p.category === activeCategory);
            setProducts(filteredProducts);

            const uniqueSubcategories = [...new Set(
                filteredProducts
                    .map(p => p.subcategory)
                    .filter(Boolean)
                    .filter(sub => sub !== 'none')
            )];
            
            setSubcategories(uniqueSubcategories);
        } catch (err) {
            setError('Erreur lors du chargement des produits');
            console.error('Erreur fetchProducts:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const product = products.find(p => p.id === active.id);
        if (product) {
            setDraggedProduct(product);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setDraggedProduct(null);

        if (!over || active.id === over.id) return;

        const productId = active.id as number;
        const newSubcategory = over.id === 'uncategorized' ? 'none' : over.id.toString();

        try {
            // Mise à jour optimiste
            setProducts(prev => prev.map(p =>
                p.id === productId ? { ...p, subcategory: newSubcategory } : p
            ));

            // Si on déplace vers une sous-catégorie (pas vers "uncategorized"), on l'ouvre
            if (over.id !== 'uncategorized') {
                setSelectedSubcategory(over.id.toString());
            }

            await axios.put(`${API_URL}/products/${productId}/subcategory`, { newSubcategory });
        } catch (err) {
            setError('Erreur lors de la mise à jour de la sous-catégorie');
            console.error(err);
            await fetchProducts();
        }
    };

    const addSubcategory = async () => {
        if (!newSubcategory.trim()) return;
        if (subcategories.includes(newSubcategory.trim())) {
            setError('Cette sous-catégorie existe déjà');
            return;
        }
        setSubcategories(prev => [...prev, newSubcategory.trim()]);
        setNewSubcategory('');
        setError(null);
    };

    const removeFromSubcategory = async (productId: number) => {
        try {
            // Mise à jour optimiste
            setProducts(prev => {
                const newProducts = prev.map(p =>
                    p.id === productId ? { ...p, subcategory: 'none' } : p
                );
                
                // Si c'était le dernier produit de la sous-catégorie, on ferme le panel
                if (selectedSubcategory && 
                    !newProducts.some(p => p.subcategory === selectedSubcategory)) {
                    setSelectedSubcategory(null);
                }
                
                return newProducts;
            });

            await axios.put(`${API_URL}/products/${productId}/subcategory`, { 
                newSubcategory: 'none' 
            });
        } catch (err) {
            setError('Erreur lors de la mise à jour de la sous-catégorie');
            console.error(err);
            await fetchProducts();
        }
    };

    if (isLoading) return <div className="subcategory-loading"><div className="loading-spinner" /></div>;

    const uncategorizedProducts = products.filter(p => !p.subcategory || p.subcategory === 'none');
    const selectedProducts = selectedSubcategory 
        ? products.filter(p => p.subcategory === selectedSubcategory)
        : [];

    return (
        <div className="subcategory-manager">
            <div className="subcategory-header">
                <div className="header-top">
                    <button 
                        className="back-button"
                        onClick={() => navigate('/')}
                    >
                        <FaArrowLeft />
                        <span>Retour à la caisse</span>
                    </button>
                    <h1>Gestion des sous-catégories</h1>
                </div>
                <CategorySelector 
                    activeCategory={activeCategory} 
                    onCategoryChange={setActiveCategory} 
                />
                <div className="subcategory-form">
                    <input
                        type="text"
                        value={newSubcategory}
                        onChange={(e) => setNewSubcategory(e.target.value)}
                        placeholder="Nouvelle sous-catégorie"
                        className={error ? 'error' : ''}
                    />
                    <button onClick={addSubcategory} disabled={!newSubcategory.trim()}>
                        <FaPlus />
                        <span>Ajouter</span>
                    </button>
                </div>
                {error && <div className="error-message">{error}</div>}
            </div>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="subcategories-layout">
                    {/* Colonne Sans sous-catégorie */}
                    <DroppableZone id="uncategorized" className="uncategorized-column">
                        <div className="column-header">
                            <h2>Sans sous-catégorie</h2>
                            <span className="product-count">{uncategorizedProducts.length} produit(s)</span>
                        </div>
                        <div className="products-list">
                            <SortableContext items={uncategorizedProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                {uncategorizedProducts.map(product => (
                                    <SortableItem key={product.id} id={product.id}>
                                        <div className="product-item">
                                            <div className="product-info">
                                                <span className="product-name">{product.fullName}</span>
                                                <span className="product-meta">{product.category}</span>
                                            </div>
                                        </div>
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </div>
                    </DroppableZone>

                    {/* Colonne des sous-catégories */}
                    <div className="subcategories-column">
                        {subcategories.map(subcategory => (
                            <DroppableZone 
                                key={subcategory} 
                                id={subcategory}
                                className={`subcategory-card ${selectedSubcategory === subcategory ? 'selected' : ''}`}
                            >
                                <div 
                                    className="subcategory-header"
                                    onClick={() => setSelectedSubcategory(subcategory)}
                                >
                                    <span className="subcategory-name">{subcategory}</span>
                                    <span className="product-count">
                                        {products.filter(p => p.subcategory === subcategory).length} produit(s)
                                    </span>
                                </div>
                            </DroppableZone>
                        ))}
                    </div>

                    {/* Colonne des produits de la sous-catégorie sélectionnée */}
                    {selectedSubcategory && (
                        <div className="selected-products-column">
                            <div className="column-header">
                                <h2>{selectedSubcategory}</h2>
                                <span className="product-count">{selectedProducts.length} produit(s)</span>
                            </div>
                            <div className="products-list">
                                <SortableContext items={selectedProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                    {selectedProducts.map(product => (
                                        <SortableItem key={product.id} id={product.id}>
                                            <div className="product-item">
                                                <div className="product-info">
                                                    <span className="product-name">{product.fullName}</span>
                                                    <span className="product-meta">{product.category}</span>
                                                </div>
                                                <button 
                                                    className="remove-from-subcategory"
                                                    onClick={() => removeFromSubcategory(product.id)}
                                                    title="Retirer de la sous-catégorie"
                                                >
                                                    <FaArrowLeft />
                                                    <span>Retirer</span>
                                                </button>
                                            </div>
                                        </SortableItem>
                                    ))}
                                </SortableContext>
                            </div>
                        </div>
                    )}
                </div>

                <DragOverlay>
                    {draggedProduct && (
                        <div className="product-item dragging">
                            <div className="product-info">
                                <span className="product-name">{draggedProduct.fullName}</span>
                                <span className="product-meta">{draggedProduct.category}</span>
                            </div>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default SubcategoryManager;