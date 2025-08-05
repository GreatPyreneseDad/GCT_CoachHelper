import { useOptimistic, useTransition } from 'react';
import { toast } from 'sonner';

type OptimisticState<T> = {
  data: T;
  isPending: boolean;
  error?: string;
};

export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (newData: T) => Promise<T>
) {
  const [isPending, startTransition] = useTransition();
  const [optimisticData, setOptimisticData] = useOptimistic(
    initialData,
    (_, newData: T) => newData
  );

  const update = async (newData: T) => {
    startTransition(async () => {
      setOptimisticData(newData);
      
      try {
        const result = await updateFn(newData);
        toast.success('Changes saved');
        return result;
      } catch (error) {
        // Revert on error
        setOptimisticData(initialData);
        toast.error('Failed to save changes');
        throw error;
      }
    });
  };

  return {
    data: optimisticData,
    update,
    isPending,
  };
}

// For list operations
export function useOptimisticList<T extends { id: string }>(
  initialItems: T[],
  handlers: {
    add?: (item: T) => Promise<T>;
    update?: (id: string, item: Partial<T>) => Promise<T>;
    remove?: (id: string) => Promise<void>;
    reorder?: (items: T[]) => Promise<T[]>;
  }
) {
  const [isPending, startTransition] = useTransition();
  const [optimisticItems, setOptimisticItems] = useOptimistic(
    initialItems,
    (currentItems, action: { type: string; payload: any }) => {
      switch (action.type) {
        case 'add':
          return [...currentItems, action.payload];
        case 'update':
          return currentItems.map(item =>
            item.id === action.payload.id
              ? { ...item, ...action.payload.updates }
              : item
          );
        case 'remove':
          return currentItems.filter(item => item.id !== action.payload);
        case 'reorder':
          return action.payload;
        default:
          return currentItems;
      }
    }
  );

  const add = async (item: T) => {
    if (!handlers.add) throw new Error('Add handler not provided');
    
    startTransition(async () => {
      setOptimisticItems({ type: 'add', payload: item });
      
      try {
        const result = await handlers.add(item);
        toast.success('Item added');
        return result;
      } catch (error) {
        setOptimisticItems({ type: 'remove', payload: item.id });
        toast.error('Failed to add item');
        throw error;
      }
    });
  };

  const update = async (id: string, updates: Partial<T>) => {
    if (!handlers.update) throw new Error('Update handler not provided');
    
    const originalItem = optimisticItems.find(item => item.id === id);
    if (!originalItem) return;

    startTransition(async () => {
      setOptimisticItems({ type: 'update', payload: { id, updates } });
      
      try {
        const result = await handlers.update(id, updates);
        toast.success('Changes saved');
        return result;
      } catch (error) {
        setOptimisticItems({ 
          type: 'update', 
          payload: { id, updates: originalItem } 
        });
        toast.error('Failed to save changes');
        throw error;
      }
    });
  };

  const remove = async (id: string) => {
    if (!handlers.remove) throw new Error('Remove handler not provided');
    
    const originalItem = optimisticItems.find(item => item.id === id);
    if (!originalItem) return;

    startTransition(async () => {
      setOptimisticItems({ type: 'remove', payload: id });
      
      try {
        await handlers.remove(id);
        toast.success('Item removed');
      } catch (error) {
        setOptimisticItems({ type: 'add', payload: originalItem });
        toast.error('Failed to remove item');
        throw error;
      }
    });
  };

  const reorder = async (newOrder: T[]) => {
    if (!handlers.reorder) throw new Error('Reorder handler not provided');
    
    const originalOrder = [...optimisticItems];

    startTransition(async () => {
      setOptimisticItems({ type: 'reorder', payload: newOrder });
      
      try {
        const result = await handlers.reorder(newOrder);
        toast.success('Order updated');
        return result;
      } catch (error) {
        setOptimisticItems({ type: 'reorder', payload: originalOrder });
        toast.error('Failed to update order');
        throw error;
      }
    });
  };

  return {
    items: optimisticItems,
    add,
    update,
    remove,
    reorder,
    isPending,
  };
}