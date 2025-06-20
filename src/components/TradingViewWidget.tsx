'use client';

import React, { useEffect, useRef } from 'react';

const TradingViewWidget: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        ['BVC:PFCIBEST|1D'],
      ],
      chartOnly: false,
      width: '100%',
      height: 400,
      locale: 'es',
      colorTheme: 'dark',
      autosize: true,
      showVolume: true,
      showMA: true,
    });

    if (container.current) {
      container.current.innerHTML = ''; // Clear previous widget
      container.current.appendChild(script);
    }
  }, []);

  return <div className="tradingview-widget-container" ref={container} />;
};

export default TradingViewWidget;
