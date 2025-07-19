import React from 'react';

/**
 * Barra de loading que aparece durante o carregamento de páginas
 */
const LoadingBar = ({ isLoading, loadingComplete }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-bar">
      <div className={`loading-progress ${loadingComplete ? 'complete' : ''}`}></div>
    </div>
  );
};

export default LoadingBar;
