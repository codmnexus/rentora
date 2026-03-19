// Simple hash-based SPA router
const listeners = [];
let currentRoute = parseRoute();

function parseRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const [path, queryString] = hash.split('?');
  const params = {};
  
  // Parse path params like /property/123
  const segments = path.split('/').filter(Boolean);
  
  // Parse query params
  if (queryString) {
    queryString.split('&').forEach(pair => {
      const [key, val] = pair.split('=');
      params[key] = decodeURIComponent(val || '');
    });
  }

  return { path, segments, params, full: hash };
}

export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return currentRoute;
}

export function onRouteChange(callback) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

window.addEventListener('hashchange', () => {
  currentRoute = parseRoute();
  listeners.forEach(cb => cb(currentRoute));
});

// Parse route pattern like /property/:id
export function matchRoute(pattern, path) {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  
  if (patternParts.length !== pathParts.length) return null;
  
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}
