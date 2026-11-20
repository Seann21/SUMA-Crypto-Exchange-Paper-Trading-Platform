'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { useMarketData } from '@/context/MarketDataContext';
import { TIMEFRAMES } from '@/lib/constants';
import { formatIDR, formatPercent } from '@/lib/utils';
import { CandlestickData } from '@/types/crypto';
import { BarChart3, LineChart, Maximize2, RefreshCw } from 'lucide-react';

interface LightweightChartProps {
  height?: number;
  className?: string;
  showControls?: boolean;
}

export function LightweightChart({ height = 480, className = '', showControls = true }: LightweightChartProps) {
  const { selectedAsset, livePrice, selectedPair } = useMarketData();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('15m');
  const [chartType, setChartType] = useState<'candle' | 'area'>('candle');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [barHoverData, setBarHoverData] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    change: number;
  } | null>(null);

  const rawCandlesRef = useRef<CandlestickData[]>([]);

  // Fetch candle data
  const loadCandles = useCallback(async () => {
    if (!selectedAsset) return;
    setIsLoading(true);

    try {
      const days = selectedTimeframe === '1H' || selectedTimeframe === '4h' ? 7 : 1;
      const res = await fetch(`/api/crypto/ohlc?coinId=${selectedAsset.id}&days=${days}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        rawCandlesRef.current = json.data;
        updateChartData(json.data);
      }
    } catch (e) {
      console.error('Failed to load OHLC candles:', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAsset?.id, selectedTimeframe]);

  // Update chart with candles
  const updateChartData = (data: CandlestickData[]) => {
    if (!data || data.length === 0) return;

    // Format for Lightweight Charts
    const tvCandles = data.map((c) => ({
      time: (typeof c.time === 'number' ? c.time : Math.floor(new Date(c.time).getTime() / 1000)) as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    if (candleSeriesRef.current && chartType === 'candle') {
      candleSeriesRef.current.setData(tvCandles);
    }

    if (areaSeriesRef.current && chartType === 'area') {
      const lineData = tvCandles.map((c) => ({
        time: c.time,
        value: c.close,
      }));
      areaSeriesRef.current.setData(lineData);
    }

    const last = data[data.length - 1];
    if (last) {
      const change = ((last.close - last.open) / last.open) * 100;
      setBarHoverData({
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
        change,
      });
    }

    chartRef.current?.timeScale().fitContent();
  };

  // Initialize TradingView Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
      },
      crosshair: {
        vertLine: {
          color: '#f59e0b',
          width: 1,
          style: 3,
          labelBackgroundColor: '#f59e0b',
        },
        horzLine: {
          color: '#f59e0b',
          width: 1,
          style: 3,
          labelBackgroundColor: '#f59e0b',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(30, 41, 59, 0.8)',
        textColor: '#cbd5e1',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: 'rgba(30, 41, 59, 0.8)',
        timeVisible: true,
        secondsVisible: false,
      },
      width: container.clientWidth,
      height: height,
    });

    // Candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // Area series for line view
    const areaSeries = chart.addAreaSeries({
      topColor: 'rgba(245, 158, 11, 0.35)',
      bottomColor: 'rgba(245, 158, 11, 0.02)',
      lineColor: '#f59e0b',
      lineWidth: 2,
      visible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    areaSeriesRef.current = areaSeries;

    // Crosshair hover listener
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) return;
      const data = param.seriesData.get(candleSeries) as any;
      if (data) {
        const change = ((data.close - data.open) / data.open) * 100;
        setBarHoverData({
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          change,
        });
      }
    });

    // Resize observer
    const handleResize = () => {
      if (container && chart) {
        chart.applyOptions({ width: container.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [height]);

  // Handle chart type toggle
  useEffect(() => {
    if (!candleSeriesRef.current || !areaSeriesRef.current) return;
    if (chartType === 'candle') {
      candleSeriesRef.current.applyOptions({ visible: true });
      areaSeriesRef.current.applyOptions({ visible: false });
    } else {
      candleSeriesRef.current.applyOptions({ visible: false });
      areaSeriesRef.current.applyOptions({ visible: true });
    }
    updateChartData(rawCandlesRef.current);
  }, [chartType]);

  // Load candles when asset or timeframe changes
  useEffect(() => {
    loadCandles();
  }, [loadCandles]);

  // Update latest bar with live tick price!
  useEffect(() => {
    if (!livePrice || rawCandlesRef.current.length === 0) return;

    const lastIdx = rawCandlesRef.current.length - 1;
    const lastBar = rawCandlesRef.current[lastIdx];
    if (!lastBar) return;

    const updatedBar: CandlestickData = {
      ...lastBar,
      close: livePrice,
      high: Math.max(lastBar.high, livePrice),
      low: Math.min(lastBar.low, livePrice),
    };

    rawCandlesRef.current[lastIdx] = updatedBar;

    const tvBar = {
      time: (typeof updatedBar.time === 'number' ? updatedBar.time : Math.floor(new Date(updatedBar.time).getTime() / 1000)) as UTCTimestamp,
      open: updatedBar.open,
      high: updatedBar.high,
      low: updatedBar.low,
      close: updatedBar.close,
    };

    if (candleSeriesRef.current && chartType === 'candle') {
      candleSeriesRef.current.update(tvBar);
    }
    if (areaSeriesRef.current && chartType === 'area') {
      areaSeriesRef.current.update({ time: tvBar.time, value: tvBar.close });
    }

    const change = ((updatedBar.close - updatedBar.open) / updatedBar.open) * 100;
    setBarHoverData({
      open: updatedBar.open,
      high: updatedBar.high,
      low: updatedBar.low,
      close: updatedBar.close,
      change,
    });
  }, [livePrice, chartType]);

  return (
    <div className={`relative flex flex-col w-full bg-[#0d1320] border border-surface-border rounded-2xl overflow-hidden shadow-lg ${className}`}>
      {/* Top Header / Chart Controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-surface-border/70 bg-[#0a0e18]/80">
          {/* Pair info and OHLC Stats */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{selectedPair}</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live 1.4s
              </span>
            </div>

            {barHoverData && (
              <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>O: <strong className="text-slate-200">{formatIDR(barHoverData.open, { hideSymbol: true })}</strong></span>
                <span>H: <strong className="text-emerald-400">{formatIDR(barHoverData.high, { hideSymbol: true })}</strong></span>
                <span>L: <strong className="text-rose-400">{formatIDR(barHoverData.low, { hideSymbol: true })}</strong></span>
                <span>C: <strong className="text-white">{formatIDR(barHoverData.close, { hideSymbol: true })}</strong></span>
                <span className={barHoverData.change >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {formatPercent(barHoverData.change)}
                </span>
              </div>
            )}
          </div>

          {/* Timeframe & Chart Style Toggles */}
          <div className="flex items-center gap-2">
            {/* Timeframe pills */}
            <div className="flex items-center bg-surface-subtle border border-surface-border rounded-lg p-0.5 text-xs">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setSelectedTimeframe(tf.value)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    selectedTimeframe === tf.value
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Candle vs Line Toggle */}
            <div className="flex items-center bg-surface-subtle border border-surface-border rounded-lg p-0.5">
              <button
                onClick={() => setChartType('candle')}
                title="Candlestick"
                className={`p-1.5 rounded-md transition-colors ${
                  chartType === 'candle' ? 'bg-surface-hover text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('area')}
                title="Line Area"
                className={`p-1.5 rounded-md transition-colors ${
                  chartType === 'area' ? 'bg-surface-hover text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LineChart className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={loadCandles}
              title="Refresh Chart"
              className="p-1.5 rounded-lg bg-surface-subtle hover:bg-surface-hover text-slate-400 hover:text-amber-400 border border-surface-border transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="relative w-full flex-1 min-h-[380px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0d1320]/60 backdrop-blur-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-surface-border text-xs text-amber-400 font-medium">
              <span className="w-3.5 h-3.5 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
              Memuat data grafik {selectedPair}...
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {/* Watermark branding in bottom corner */}
      <div className="absolute bottom-3 left-4 pointer-events-none opacity-30 select-none flex items-center gap-1.5">
        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
          SUMA LIGHTWEIGHT CHARTS • TRADINGVIEW ENGINE
        </span>
      </div>
    </div>
  );
}

