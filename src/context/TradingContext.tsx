'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderSide, OrderType, UserPortfolio, AssetHolding } from '@/types/trading';
import { INITIAL_DEMO_BALANCE_IDR } from '@/lib/constants';
import { useMarketData } from './MarketDataContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

interface TradingContextType {
  portfolio: UserPortfolio;
  placeOrder: (params: {
    pair: string;
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    totalIdr: number;
  }) => { success: boolean; message: string };
  cancelOrder: (orderId: string) => void;
  resetPortfolio: () => void;
  totalPortfolioValueIdr: number;
  totalPnLIdr: number;
  totalPnLPercentage: number;
  getHolding: (symbol: string) => AssetHolding;
  user: any | null;
  signOut: () => Promise<void>;
}

const LOCAL_STORAGE_KEY = 'suma_paper_trading_portfolio_v2';

const initialPortfolio: UserPortfolio = {
  cashIdr: INITIAL_DEMO_BALANCE_IDR,
  holdings: {
    BTC: { symbol: 'BTC', name: 'Bitcoin', amount: 0, avgBuyPriceIdr: 0, totalInvestedIdr: 0 },
    ETH: { symbol: 'ETH', name: 'Ethereum', amount: 0, avgBuyPriceIdr: 0, totalInvestedIdr: 0 },
    SOL: { symbol: 'SOL', name: 'Solana', amount: 0, avgBuyPriceIdr: 0, totalInvestedIdr: 0 },
  },
  orders: [],
  realizedPnLIdr: 0,
};

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const { markets, livePrice, selectedPair } = useMarketData();
  const [portfolio, setPortfolio] = useState<UserPortfolio>(initialPortfolio);
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  // Load user session from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      loadFromLocalStorage();
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadFromSupabase(session.user.id);
      } else {
        loadFromLocalStorage();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadFromSupabase(session.user.id);
      } else {
        setUser(null);
        loadFromLocalStorage();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPortfolio(parsed);
      }
    } catch (e) {
      console.warn('Failed to load portfolio from localStorage', e);
    } finally {
      setIsHydrated(true);
    }
  };

  const loadFromSupabase = async (userId: string) => {
    if (!supabase) return;
    try {
      // 1. Fetch portfolio cash
      const { data: pData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .single();

      // 2. Fetch holdings
      const { data: hData } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userId);

      // 3. Fetch orders
      const { data: oData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const holdingsMap = { ...initialPortfolio.holdings };
      if (hData && Array.isArray(hData)) {
        hData.forEach((h: any) => {
          holdingsMap[h.symbol] = {
            symbol: h.symbol,
            name: h.symbol === 'BTC' ? 'Bitcoin' : h.symbol === 'ETH' ? 'Ethereum' : 'Solana',
            amount: parseFloat(h.amount) || 0,
            avgBuyPriceIdr: parseFloat(h.avg_buy_price_idr) || 0,
            totalInvestedIdr: parseFloat(h.total_invested_idr) || 0,
          };
        });
      }

      const ordersList: Order[] = (oData || []).map((o: any) => ({
        id: o.id,
        pair: o.pair,
        assetId: o.pair.split('/')[0].toLowerCase(),
        side: o.side,
        type: o.type,
        price: parseFloat(o.price),
        amount: parseFloat(o.amount),
        totalIdr: parseFloat(o.total_idr),
        feeIdr: parseFloat(o.fee_idr || 0),
        status: o.status,
        createdAt: new Date(o.created_at).getTime(),
        filledAt: o.filled_at ? new Date(o.filled_at).getTime() : undefined,
      }));

      setPortfolio({
        cashIdr: pData ? parseFloat(pData.cash_idr) : INITIAL_DEMO_BALANCE_IDR,
        holdings: holdingsMap,
        orders: ordersList,
        realizedPnLIdr: 0,
      });
    } catch (err) {
      console.warn('Could not load portfolio from Supabase, using local fallback:', err);
      loadFromLocalStorage();
    } finally {
      setIsHydrated(true);
    }
  };

  // Sync to LocalStorage for guest users
  useEffect(() => {
    if (isHydrated && !user) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(portfolio));
      } catch (e) {
        console.warn('Failed to save portfolio to localStorage', e);
      }
    }
  }, [portfolio, isHydrated, user]);

  // Sign out helper
  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      loadFromLocalStorage();
      toast.info('Berhasil Logout', {
        description: 'Anda sekarang kembali ke Mode Guest Demo.',
      });
    }
  };

  // Helper to get holding
  const getHolding = (symbol: string): AssetHolding => {
    return (
      portfolio.holdings[symbol] || {
        symbol,
        name: symbol,
        amount: 0,
        avgBuyPriceIdr: 0,
        totalInvestedIdr: 0,
      }
    );
  };

  // Check pending limit orders against current livePrice
  useEffect(() => {
    if (!livePrice || portfolio.orders.length === 0) return;

    const pendingOrders = portfolio.orders.filter((o) => o.status === 'pending');
    if (pendingOrders.length === 0) return;

    let updatedOrders = [...portfolio.orders];
    let updatedHoldings = { ...portfolio.holdings };
    let updatedCash = portfolio.cashIdr;
    let hasExecution = false;

    pendingOrders.forEach((order) => {
      const symbol = order.pair.split('/')[0];
      const holding = updatedHoldings[symbol] || {
        symbol,
        name: symbol,
        amount: 0,
        avgBuyPriceIdr: 0,
        totalInvestedIdr: 0,
      };

      // Check Buy Limit: executed when live price drops to or below target
      if (order.side === 'buy' && livePrice <= order.price) {
        hasExecution = true;
        const newTotalAmount = holding.amount + order.amount;
        const newTotalInvested = holding.totalInvestedIdr + order.totalIdr;
        const newAvg = newTotalAmount > 0 ? newTotalInvested / newTotalAmount : 0;

        updatedHoldings[symbol] = {
          ...holding,
          amount: newTotalAmount,
          avgBuyPriceIdr: newAvg,
          totalInvestedIdr: newTotalInvested,
        };

        const idx = updatedOrders.findIndex((o) => o.id === order.id);
        if (idx !== -1) {
          updatedOrders[idx] = {
            ...order,
            status: 'filled',
            filledAt: Date.now(),
          };
        }

        toast.success(`Limit Buy Terisi!`, {
          description: `Beli ${order.amount} ${symbol} di harga Rp ${order.price.toLocaleString('id-ID')}`,
        });
      }

      // Check Sell Limit: executed when live price rises to or above target
      if (order.side === 'sell' && livePrice >= order.price) {
        hasExecution = true;
        updatedCash += order.totalIdr;

        const idx = updatedOrders.findIndex((o) => o.id === order.id);
        if (idx !== -1) {
          updatedOrders[idx] = {
            ...order,
            status: 'filled',
            filledAt: Date.now(),
          };
        }

        toast.success(`Limit Sell Terisi!`, {
          description: `Jual ${order.amount} ${symbol} di harga Rp ${order.price.toLocaleString('id-ID')}`,
        });
      }
    });

    if (hasExecution) {
      setPortfolio((prev) => ({
        ...prev,
        cashIdr: updatedCash,
        holdings: updatedHoldings,
        orders: updatedOrders,
      }));
    }
  }, [livePrice]);

  // Execute or place an order
  const placeOrder = ({
    pair,
    side,
    type,
    price,
    amount,
    totalIdr,
  }: {
    pair: string;
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    totalIdr: number;
  }) => {
    const symbol = pair.split('/')[0];
    const holding = getHolding(symbol);

    if (amount <= 0 || totalIdr <= 0) {
      return { success: false, message: 'Jumlah order harus lebih besar dari 0' };
    }

    if (side === 'buy') {
      if (portfolio.cashIdr < totalIdr) {
        toast.error('Saldo IDR tidak cukup!', {
          description: `Dibutuhkan Rp ${totalIdr.toLocaleString('id-ID')}, saldo tersisa Rp ${portfolio.cashIdr.toLocaleString('id-ID')}`,
        });
        return { success: false, message: 'Saldo IDR tidak cukup' };
      }

      const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      if (type === 'market') {
        // Market Buy executes immediately
        const newTotalAmount = holding.amount + amount;
        const newTotalInvested = holding.totalInvestedIdr + totalIdr;
        const newAvg = newTotalAmount > 0 ? newTotalInvested / newTotalAmount : 0;
        const remainingCash = portfolio.cashIdr - totalIdr;

        const newOrder: Order = {
          id: orderId,
          pair,
          assetId: symbol.toLowerCase(),
          side: 'buy',
          type: 'market',
          price,
          amount,
          totalIdr,
          feeIdr: 0,
          status: 'filled',
          createdAt: Date.now(),
          filledAt: Date.now(),
        };

        setPortfolio((prev) => ({
          ...prev,
          cashIdr: remainingCash,
          holdings: {
            ...prev.holdings,
            [symbol]: {
              ...holding,
              amount: newTotalAmount,
              avgBuyPriceIdr: newAvg,
              totalInvestedIdr: newTotalInvested,
            },
          },
          orders: [newOrder, ...prev.orders],
        }));

        // Sync with Supabase if logged in
        if (user && supabase) {
          supabase.from('portfolios').update({ cash_idr: remainingCash }).eq('user_id', user.id).then();
          supabase.from('holdings').upsert({
            user_id: user.id,
            symbol,
            amount: newTotalAmount,
            avg_buy_price_idr: newAvg,
            total_invested_idr: newTotalInvested,
          }, { onConflict: 'user_id,symbol' }).then();
          supabase.from('orders').insert({
            user_id: user.id,
            pair,
            side: 'buy',
            type: 'market',
            price,
            amount,
            total_idr: totalIdr,
            fee_idr: 0,
            status: 'filled',
            filled_at: new Date().toISOString(),
          }).then();
        }

        toast.success(`Market Buy Berhasil!`, {
          description: `Membeli ${amount} ${symbol} senilai Rp ${totalIdr.toLocaleString('id-ID')}`,
        });
        return { success: true, message: 'Order beli instan berhasil' };
      } else {
        // Limit Buy reserves cash and waits
        const newOrder: Order = {
          id: orderId,
          pair,
          assetId: symbol.toLowerCase(),
          side: 'buy',
          type: 'limit',
          price,
          amount,
          totalIdr,
          feeIdr: 0,
          status: 'pending',
          createdAt: Date.now(),
        };

        const remainingCash = portfolio.cashIdr - totalIdr;

        setPortfolio((prev) => ({
          ...prev,
          cashIdr: remainingCash,
          orders: [newOrder, ...prev.orders],
        }));

        if (user && supabase) {
          supabase.from('portfolios').update({ cash_idr: remainingCash }).eq('user_id', user.id).then();
          supabase.from('orders').insert({
            user_id: user.id,
            pair,
            side: 'buy',
            type: 'limit',
            price,
            amount,
            total_idr: totalIdr,
            fee_idr: 0,
            status: 'pending',
          }).then();
        }

        toast.info(`Limit Buy Dibuat`, {
          description: `Menunggu harga menyentuh Rp ${price.toLocaleString('id-ID')}`,
        });
        return { success: true, message: 'Limit Buy berhasil dipasang' };
      }
    } else {
      // Side: SELL
      if (holding.amount < amount) {
        toast.error(`Saldo ${symbol} tidak cukup!`, {
          description: `Anda memiliki ${holding.amount} ${symbol}, mencoba menjual ${amount} ${symbol}`,
        });
        return { success: false, message: `Saldo ${symbol} tidak cukup` };
      }

      const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      if (type === 'market') {
        const costBasisPortion = holding.avgBuyPriceIdr * amount;
        const profitLoss = totalIdr - costBasisPortion;
        const remainingAmount = holding.amount - amount;
        const remainingInvested = Math.max(0, holding.totalInvestedIdr - costBasisPortion);
        const newCash = portfolio.cashIdr + totalIdr;

        const newOrder: Order = {
          id: orderId,
          pair,
          assetId: symbol.toLowerCase(),
          side: 'sell',
          type: 'market',
          price,
          amount,
          totalIdr,
          feeIdr: 0,
          status: 'filled',
          createdAt: Date.now(),
          filledAt: Date.now(),
        };

        setPortfolio((prev) => ({
          ...prev,
          cashIdr: newCash,
          realizedPnLIdr: prev.realizedPnLIdr + profitLoss,
          holdings: {
            ...prev.holdings,
            [symbol]: {
              ...holding,
              amount: remainingAmount,
              totalInvestedIdr: remainingInvested,
            },
          },
          orders: [newOrder, ...prev.orders],
        }));

        if (user && supabase) {
          supabase.from('portfolios').update({ cash_idr: newCash }).eq('user_id', user.id).then();
          supabase.from('holdings').upsert({
            user_id: user.id,
            symbol,
            amount: remainingAmount,
            avg_buy_price_idr: holding.avgBuyPriceIdr,
            total_invested_idr: remainingInvested,
          }, { onConflict: 'user_id,symbol' }).then();
          supabase.from('orders').insert({
            user_id: user.id,
            pair,
            side: 'sell',
            type: 'market',
            price,
            amount,
            total_idr: totalIdr,
            fee_idr: 0,
            status: 'filled',
            filled_at: new Date().toISOString(),
          }).then();
        }

        toast.success(`Market Sell Berhasil!`, {
          description: `Menjual ${amount} ${symbol} dapat Rp ${totalIdr.toLocaleString('id-ID')}`,
        });
        return { success: true, message: 'Order jual instan berhasil' };
      } else {
        const remainingAmount = holding.amount - amount;
        const costBasisPortion = holding.avgBuyPriceIdr * amount;
        const remainingInvested = Math.max(0, holding.totalInvestedIdr - costBasisPortion);

        const newOrder: Order = {
          id: orderId,
          pair,
          assetId: symbol.toLowerCase(),
          side: 'sell',
          type: 'limit',
          price,
          amount,
          totalIdr,
          feeIdr: 0,
          status: 'pending',
          createdAt: Date.now(),
        };

        setPortfolio((prev) => ({
          ...prev,
          holdings: {
            ...prev.holdings,
            [symbol]: {
              ...holding,
              amount: remainingAmount,
              totalInvestedIdr: remainingInvested,
            },
          },
          orders: [newOrder, ...prev.orders],
        }));

        if (user && supabase) {
          supabase.from('holdings').upsert({
            user_id: user.id,
            symbol,
            amount: remainingAmount,
            avg_buy_price_idr: holding.avgBuyPriceIdr,
            total_invested_idr: remainingInvested,
          }, { onConflict: 'user_id,symbol' }).then();
          supabase.from('orders').insert({
            user_id: user.id,
            pair,
            side: 'sell',
            type: 'limit',
            price,
            amount,
            total_idr: totalIdr,
            fee_idr: 0,
            status: 'pending',
          }).then();
        }

        toast.info(`Limit Sell Dibuat`, {
          description: `Menunggu harga naik ke Rp ${price.toLocaleString('id-ID')}`,
        });
        return { success: true, message: 'Limit Sell berhasil dipasang' };
      }
    }
  };

  // Cancel pending order
  const cancelOrder = (orderId: string) => {
    const order = portfolio.orders.find((o) => o.id === orderId && o.status === 'pending');
    if (!order) return;

    const symbol = order.pair.split('/')[0];
    const holding = getHolding(symbol);

    let updatedCash = portfolio.cashIdr;
    let updatedHoldings = { ...portfolio.holdings };

    if (order.side === 'buy') {
      updatedCash += order.totalIdr;
    } else {
      updatedHoldings[symbol] = {
        ...holding,
        amount: holding.amount + order.amount,
        totalInvestedIdr: holding.totalInvestedIdr + holding.avgBuyPriceIdr * order.amount,
      };
    }

    setPortfolio((prev) => ({
      ...prev,
      cashIdr: updatedCash,
      holdings: updatedHoldings,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' as const } : o)),
    }));

    if (user && supabase) {
      if (order.side === 'buy') {
        supabase.from('portfolios').update({ cash_idr: updatedCash }).eq('user_id', user.id).then();
      } else {
        supabase.from('holdings').upsert({
          user_id: user.id,
          symbol,
          amount: updatedHoldings[symbol].amount,
          avg_buy_price_idr: updatedHoldings[symbol].avgBuyPriceIdr,
          total_invested_idr: updatedHoldings[symbol].totalInvestedIdr,
        }, { onConflict: 'user_id,symbol' }).then();
      }
      supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId).then();
    }

    toast.info('Order Dibatalkan', {
      description: `Order ${order.side.toUpperCase()} ${order.amount} ${symbol} telah dibatalkan`,
    });
  };

  // Reset portfolio to IDR 100 Juta
  const resetPortfolio = () => {
    const fresh: UserPortfolio = {
      cashIdr: INITIAL_DEMO_BALANCE_IDR,
      holdings: {
        BTC: { symbol: 'BTC', name: 'Bitcoin', amount: 0, avgBuyPriceIdr: 0, totalInvestedIdr: 0 },
        ETH: { symbol: 'ETH', name: 'Ethereum', amount: 0, avgBuyPriceIdr: 0, totalInvestedIdr: 0 },
        SOL: { symbol: 'SOL', name: 'Solana', amount: 0, avgBuyPriceIdr: 0, totalInvestedIdr: 0 },
      },
      orders: [],
      realizedPnLIdr: 0,
    };
    setPortfolio(fresh);

    if (user && supabase) {
      supabase.from('portfolios').update({ cash_idr: INITIAL_DEMO_BALANCE_IDR }).eq('user_id', user.id).then();
      supabase.from('holdings').delete().eq('user_id', user.id).then();
      supabase.from('orders').delete().eq('user_id', user.id).then();
    } else {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fresh));
      } catch (e) {}
    }

    toast.success('Saldo Berhasil Direset!', {
      description: 'Saldo virtual Anda kembali menjadi Rp 100.000.000',
    });
  };

  // Compute Total Portfolio Value
  const totalCryptoValueIdr = Object.values(portfolio.holdings).reduce((sum, h) => {
    if (h.amount <= 0) return sum;
    const market = markets.find((m) => m.symbol === h.symbol);
    const curPrice =
      h.symbol === selectedPair.split('/')[0] ? livePrice : market?.current_price || 0;
    return sum + h.amount * curPrice;
  }, 0);

  const totalPortfolioValueIdr = portfolio.cashIdr + totalCryptoValueIdr;
  const totalPnLIdr = totalPortfolioValueIdr - INITIAL_DEMO_BALANCE_IDR;
  const totalPnLPercentage = ((totalPortfolioValueIdr - INITIAL_DEMO_BALANCE_IDR) / INITIAL_DEMO_BALANCE_IDR) * 100;

  return (
    <TradingContext.Provider
      value={{
        portfolio,
        placeOrder,
        cancelOrder,
        resetPortfolio,
        totalPortfolioValueIdr,
        totalPnLIdr,
        totalPnLPercentage,
        getHolding,
        user,
        signOut,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
}
