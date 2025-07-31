import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook personalizado para gerenciar auto-refresh de abas
 */
const useAutoRefresh = (onRefresh) => {
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // 30 segundos por padrão
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  // Função para iniciar o timer
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setTimeRemaining(refreshInterval);

    // Countdown timer
    countdownRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return refreshInterval; // Reset para o próximo ciclo
        }
        return prev - 1;
      });
    }, 1000);

    // Timer principal de refresh
    intervalRef.current = setInterval(() => {
      if (onRefresh) {
        onRefresh();
      }
    }, refreshInterval * 1000);
  }, [refreshInterval, onRefresh]);

  // Função para parar o timer
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setTimeRemaining(0);
  }, []);

  // Efeito para gerenciar o estado do auto-refresh
  useEffect(() => {
    if (isAutoRefreshEnabled) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [isAutoRefreshEnabled, startAutoRefresh, stopAutoRefresh]);

  // Efeito para reiniciar quando o intervalo muda
  useEffect(() => {
    if (isAutoRefreshEnabled) {
      startAutoRefresh();
    }
  }, [refreshInterval, startAutoRefresh, isAutoRefreshEnabled]);

  // Função para toggle do auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshEnabled(prev => !prev);
  }, []);

  // Função para alterar o intervalo
  const updateRefreshInterval = useCallback((newInterval) => {
    setRefreshInterval(newInterval);
  }, []);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return {
    isAutoRefreshEnabled,
    refreshInterval,
    timeRemaining,
    toggleAutoRefresh,
    updateRefreshInterval,
    startAutoRefresh,
    stopAutoRefresh
  };
};

export default useAutoRefresh;
