import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    useSensor,
    useSensors,
    PointerSensor,
    useDroppable,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    defaultDropAnimationSideEffects,
    pointerWithin,
    getFirstCollision,
    CollisionDetection,
    UniqueIdentifier,
} from '@dnd-kit/core';
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

const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5'
            }
        }
    })
};

const DroppableContainer = ({
                                id,
                                children,
                                className,
                                isDroppable = true,
                                dataDroppableId
                            }: {
    id: string;
    children: React.ReactNode;
    className?: string;
    isDroppable?: boolean;
    dataDroppableId: string;
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: {
            accepts: isDroppable,
        }
    });

    return (
        <div
            ref={setNodeRef}
            className={`${className} ${isOver ? 'droppable-active' : ''}`}
            data-droppable={isDroppable}
            data-droppable-id={dataDroppableId}
            style={{ touchAction: 'none' }}
        >
            {children}
        </div>
    );
};

const SubcategoryManager = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [subcategories, setSubcategories] = useState<string[]>(['Sans sous-catégorie']);
    const [newSubcategory, setNewSubcategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [draggedProduct, setDraggedProduct] = useState<Product | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeContainer, setActiveContainer] = useState<UniqueIdentifier | null>(null);
    const lastOverId = useRef<UniqueIdentifier | null>(null);

    // Enhanced sensors configuration
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {})
    );

    // Fonction de détection de collision améliorée
    const collisionDetectionStrategy: CollisionDetection = useCallback(
        (args) => {
            if (activeContainer) {
                return closestCenter({ ...args });
            }

            // Première passe : détection directe avec le pointeur
            const pointerCollisions = pointerWithin(args);

            if (pointerCollisions.length > 0) {
                lastOverId.current = getFirstCollision(pointerCollisions)?.id ?? null;
                return pointerCollisions;
            }

            // Si on avait une collision précédente, on la maintient
            if (lastOverId.current && args.droppableContainers.some(container => container.id === lastOverId.current)) {
                return [{
                    id: lastOverId.current,
                    data: { droppableContainer: args.droppableContainers.find(container => container.id === lastOverId.current) }
                }];
            }

            return [];
        },
        [activeContainer]
    );

    useEffect(() => {
        fetchProducts();
    }, []);

    const scrollIntoViewIfNeeded = (element: HTMLElement) => {
        if (!element || !scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        if (elementRect.bottom > containerRect.bottom) {
            container.scrollTop += elementRect.bottom - containerRect.bottom + 20;
        } else if (elementRect.top < containerRect.top) {
            container.scrollTop -= containerRect.top - elementRect.top + 20;
        }
    };

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get<Product[]>(`${API_URL}/products`);
            setProducts(response.data);

            const uniqueSubcategories = ['Sans sous-catégorie', ...new Set(
                response.data
                    .map(p => p.subcategory)
                    .filter(Boolean)
                    .filter(sub => sub !== 'none')
            )];
            setSubcategories(uniqueSubcategories);
        } catch (err) {
            setError('Erreur lors du chargement des produits');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const product = products.find(p => p.id === active.id);
        if (product) {
            setActiveId(active.id as string);
            setDraggedProduct(product);
            
            // Trouver le container actuel
            const currentSubcategory = product.subcategory === 'none' ? 'Sans sous-catégorie' : product.subcategory;
            setActiveContainer(currentSubcategory);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        
        if (over) {
            const overId = over.id as string;
            lastOverId.current = overId;
            
            // Mettre à jour le style de la zone survolée
            const droppableElement = document.querySelector(`[data-droppable-id="${overId}"]`);
            if (droppableElement) {
                droppableElement.classList.add('droppable-active');
            }
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        // Nettoyage des états
        setActiveId(null);
        setDraggedProduct(null);
        setActiveContainer(null);
        lastOverId.current = null;

        // Supprimer tous les styles de survol
        document.querySelectorAll('.droppable-active').forEach(el => {
            el.classList.remove('droppable-active');
        });

        if (!over || active.id === over.id) return;

        const productId = active.id as string;
        const newSubcategory = over.id === 'Sans sous-catégorie' ? 'none' : over.id.toString();

        const currentProduct = products.find(p => p.id === productId);
        if (currentProduct?.subcategory === newSubcategory ||
            (currentProduct?.subcategory === 'none' && over.id === 'Sans sous-catégorie')) {
            return;
        }

        try {
            // Mise à jour optimiste de l'UI
            setProducts(prev => prev.map(p =>
                p.id === productId ? { ...p, subcategory: newSubcategory } : p
            ));

            // Appel API
            const response = await axios.put(`${API_URL}/products/${productId}`, {
                ...currentProduct,
                subcategory: newSubcategory
            });

            // Vérification de la réponse
            if (!response.data) {
                throw new Error('La mise à jour a échoué');
            }

            // Rafraîchir les données depuis le serveur pour s'assurer de la synchronisation
            await fetchProducts();
        } catch (err) {
            setError('Erreur lors de la mise à jour de la sous-catégorie');
            console.error(err);
            // Rafraîchir les données en cas d'erreur
            await fetchProducts();
        }
    };

    const addSubcategory = () => {
        if (!newSubcategory.trim()) return;
        if (subcategories.includes(newSubcategory.trim())) {
            setError('Cette sous-catégorie existe déjà');
            return;
        }
        setSubcategories(prev => [...prev, newSubcategory.trim()]);
        setNewSubcategory('');
        setError(null);
    };

    const removeSubcategory = async (subcategory: string) => {
        if (subcategory === 'Sans sous-catégorie') return;

        try {
            // Mise à jour optimiste de l'UI
            setSubcategories(prev => prev.filter(s => s !== subcategory));
            setProducts(prev => prev.map(p =>
                p.subcategory === subcategory ? { ...p, subcategory: 'none' } : p
            ));

            // Récupérer tous les produits de cette sous-catégorie
            const productsToUpdate = products.filter(p => p.subcategory === subcategory);

            // Mettre à jour chaque produit avec la nouvelle sous-catégorie
            await Promise.all(productsToUpdate.map(product => 
                axios.put(`${API_URL}/products/${product.id}`, {
                    ...product,
                    subcategory: 'none'
                })
            ));

            // Rafraîchir les données depuis le serveur
            await fetchProducts();
        } catch (err) {
            setError('Erreur lors de la suppression de la sous-catégorie');
            console.error(err);
            // Rafraîchir les données en cas d'erreur
            await fetchProducts();
        }
    };

    if (isLoading) return <div className="subcategory-loading"><div className="loading-spinner" /></div>;

    return (
        <div className="subcategory-manager">
            <div className="subcategory-header">
                <h1>Gestion des sous-catégories</h1>
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
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="subcategories-layout" ref={scrollContainerRef}>
                    <DroppableContainer id="Sans sous-catégorie" className="uncategorized-column" data-droppable-id="Sans sous-catégorie">
                        <div className="subcategory-card">
                            <div className="subcategory-header">
                                <h2>Sans sous-catégorie</h2>
                                <div className="subcategory-actions">
                                    <span className="product-count">
                                        {products.filter(p => !p.subcategory || p.subcategory === 'none').length} produit(s)
                                    </span>
                                </div>
                            </div>
                            <div className="subcategory-content">
                                <SortableContext
                                    items={products
                                        .filter(p => !p.subcategory || p.subcategory === 'none')
                                        .map(p => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {products
                                        .filter(p => !p.subcategory || p.subcategory === 'none')
                                        .map((product) => (
                                            <SortableItem
                                                key={product.id}
                                                id={product.id}
                                                isDragging={activeId === product.id}
                                            >
                                                <div className={`product-item ${activeId === product.id ? 'dragging' : ''}`}>
                                                    <div className="product-info">
                                                        <span className="product-name">{product.fullName}</span>
                                                        <span className="product-meta">{product.category}</span>
                                                    </div>
                                                </div>
                                            </SortableItem>
                                        ))}
                                </SortableContext>
                                {products.filter(p => !p.subcategory || p.subcategory === 'none').length === 0 && (
                                    <div className="empty-subcategory">Déposez des produits ici</div>
                                )}
                            </div>
                        </div>
                    </DroppableContainer>

                    <div className="subcategories-container">
                        {subcategories
                            .filter(subcategory => subcategory !== 'Sans sous-catégorie')
                            .map(subcategory => {
                                const subcategoryProducts = products.filter(p =>
                                    p.subcategory === subcategory && p.subcategory !== 'none'
                                );

                                return (
                                    <DroppableContainer
                                        key={subcategory}
                                        id={subcategory}
                                        className="subcategory-wrapper"
                                        data-droppable-id={subcategory}
                                    >
                                        <div className="subcategory-card">
                                            <div className="subcategory-header">
                                                <h2>{subcategory}</h2>
                                                <div className="subcategory-actions">
                                                    <span className="product-count">
                                                        {subcategoryProducts.length} produit(s)
                                                    </span>
                                                    <button
                                                        onClick={() => removeSubcategory(subcategory)}
                                                        className="delete-button"
                                                        title="Supprimer la sous-catégorie"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="subcategory-content">
                                                <SortableContext
                                                    items={subcategoryProducts.map(p => p.id)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    {subcategoryProducts.map((product) => (
                                                        <SortableItem
                                                            key={product.id}
                                                            id={product.id}
                                                            isDragging={activeId === product.id}
                                                        >
                                                            <div className={`product-item ${activeId === product.id ? 'dragging' : ''}`}>
                                                                <div className="product-info">
                                                                    <span className="product-name">{product.fullName}</span>
                                                                    <span className="product-meta">{product.category}</span>
                                                                </div>
                                                            </div>
                                                        </SortableItem>
                                                    ))}
                                                </SortableContext>
                                                {subcategoryProducts.length === 0 && (
                                                    <div className="empty-subcategory">Déposez des produits ici</div>
                                                )}
                                            </div>
                                        </div>
                                    </DroppableContainer>
                                );
                            })}
                    </div>
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
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