// Pre-aplicar layout para evitar saltos visuales (FOUC)
(function() {
  try {
    const layout = JSON.parse(localStorage.getItem('widgetLayout') || '{}');
    const selectors = {
      'widget-reloj': '.reloj-container',
      'widget-search': '.search-container',
      'widget-favoritos': '#favoritos-container',
      'widget-notes': '#widget-notes',
      'widget-calendar': '#widget-calendar',
      'widget-important-notes': '#widget-important-notes',
      'widget-status': '#widget-status',
      'widget-weather': '#widget-weather',
      'widget-pomodoro': '#widget-pomodoro'
    };
    let css = '';
    for (const id in layout) {
      const conf = layout[id];
      const sel = selectors[id];
      if (sel && (conf.leftPct !== undefined || conf.left !== undefined)) {
        if (conf.hidden) {
          css += `${sel} { display: none !important; } `;
          continue;
        }
        const left = conf.leftPct !== undefined ? conf.leftPct + '%' : conf.left + 'px';
        const top = conf.topPct !== undefined ? conf.topPct + '%' : conf.top + 'px';
        css += `${sel} { 
          position: absolute !important; 
          left: ${left} !important; 
          top: ${top} !important; 
          transform: none !important; 
          opacity: 1 !important; 
          visibility: visible !important;
        } `;
      }
    }
    if (css) {
      const style = document.createElement('style');
      style.id = 'early-layout-styles';
      style.innerHTML = css;
      document.head.appendChild(style);
    }
  } catch (e) { console.error('Early layout error', e); }
})();
