import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types/store'
import { useAuth } from '@/components/auth-context'

export function useStore() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('store_products')
          .select('*')
          .eq('organization_id', user.organizationId)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        // Transform Supabase data to Product type
        const transformedProducts: Product[] = (data || []).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          category: p.category,
          images: p.images || [],
          inStock: p.in_stock,
          stockQuantity: p.stock_quantity,
          rating: Number(p.rating),
          reviewCount: p.review_count,
          tags: p.tags || [],
          specifications: (p.specifications as any) || undefined,
          isDigital: p.is_digital,
          organizationId: p.organization_id,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }))

        setProducts(transformedProducts)
        setError(null)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('store-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_products',
          filter: `organization_id=eq.${user.organizationId}`,
        },
        () => {
          fetchProducts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  return {
    products,
    loading,
    error,
  }
}

