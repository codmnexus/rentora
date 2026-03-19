import { createPropertyCard } from './propertyCard.js';

export async function createPropertyGrid(properties) {
  const container = document.createElement('div');
  container.className = 'main-content';

  if (properties.length === 0) {
    container.innerHTML = '<div class="no-results"><h3>No properties found</h3><p>Try adjusting your filters</p></div>';
    return container;
  }

  // Group by area
  const areas = {};
  properties.forEach(p => {
    if (!areas[p.area]) areas[p.area] = [];
    areas[p.area].push(p);
  });

  for (const [area, props] of Object.entries(areas)) {
    const section = document.createElement('section');
    section.className = 'reveal';
    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">Popular in ${area}</h2>
        <span style="font-size:14px;color:var(--color-gray-400)">${props.length} listing${props.length !== 1 ? 's' : ''}</span>
      </div>
    `;
    const grid = document.createElement('div');
    grid.className = 'property-grid';
    for (const p of props) {
      grid.appendChild(await createPropertyCard(p));
    }
    section.appendChild(grid);
    container.appendChild(section);
  }

  // Reveal animation
  requestAnimationFrame(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  });

  return container;
}
