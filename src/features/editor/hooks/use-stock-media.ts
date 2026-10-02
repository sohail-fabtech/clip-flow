import { useCallback, useState } from 'react';
import { fetchStock, type StockItem, type StockKind } from '@/features/editor/services/pexels';

export function useStockMedia(kind: StockKind) {
  const [items, setItems] = useState<StockItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (query: string, nextPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchStock(kind, query.trim(), nextPage);
        setItems(prev => (nextPage > 1 ? [...prev, ...result.items] : result.items));
        setPage(result.page);
        setHasNextPage(result.hasNextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stock media');
        if (nextPage === 1) setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [kind],
  );

  return { items, page, hasNextPage, loading, error, load };
}
