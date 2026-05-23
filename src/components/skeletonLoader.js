/**
 * Rentora Premium Skeleton Loader System
 * Provides high-fidelity, pulsing skeleton placeholders matching the exact dimensions
 * of final loaded components to eliminate layout shifts and deliver a premium UX.
 */

export function getSkeletonCardHTML() {
  return `
    <div class="property-card skeleton-card-wrapper">
      <div class="skeleton skeleton-card" style="aspect-ratio: 16/10; border-radius: var(--radius-lg); margin-bottom: 12px; width: 100%;"></div>
      <div class="property-card-info" style="padding: 0 4px 8px 4px;">
        <div class="skeleton" style="height: 18px; width: 85%; margin-bottom: 10px; border-radius: var(--radius-sm);"></div>
        <div class="skeleton" style="height: 13px; width: 50%; margin-bottom: 12px; border-radius: var(--radius-sm);"></div>
        <div style="display: flex; gap: 8px; margin-bottom: 14px;">
          <div class="skeleton" style="height: 12px; width: 55px; border-radius: var(--radius-xs);"></div>
          <div class="skeleton" style="height: 12px; width: 70px; border-radius: var(--radius-xs);"></div>
        </div>
        <div class="skeleton" style="height: 22px; width: 40%; border-radius: var(--radius-sm);"></div>
      </div>
    </div>
  `;
}

export function getHomeSkeleton() {
  return `
    <div class="main-content" style="max-width: 1200px; margin: 0 auto; padding: 24px 16px;">
      <!-- Skeleton Search Bar -->
      <div style="background: var(--bg-surface); padding: 16px; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); margin-bottom: 24px; display: flex; gap: 12px; align-items: center;">
        <div class="skeleton" style="height: 48px; flex: 1; border-radius: var(--radius-lg);"></div>
        <div class="skeleton" style="height: 48px; width: 120px; border-radius: var(--radius-lg);"></div>
      </div>

      <!-- Skeleton Category Filter -->
      <div style="display: flex; gap: 10px; margin-bottom: 32px; overflow-x: auto; padding-bottom: 8px;">
        ${Array(6).fill(0).map(() => `<div class="skeleton" style="height: 38px; width: 95px; flex-shrink: 0; border-radius: var(--radius-full);"></div>`).join('')}
      </div>

      <!-- Skeleton Listing Sections -->
      <div style="margin-bottom: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div class="skeleton" style="height: 24px; width: 220px; border-radius: var(--radius-sm);"></div>
          <div class="skeleton" style="height: 14px; width: 80px; border-radius: var(--radius-sm);"></div>
        </div>
        <div class="property-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
          ${Array(6).fill(0).map(() => getSkeletonCardHTML()).join('')}
        </div>
      </div>
    </div>
  `;
}

export function getSearchSkeleton() {
  return `
    <div class="search-page" style="max-width: 1200px; margin: 0 auto; padding: 24px 16px; display: grid; grid-template-columns: 280px 1fr; gap: 32px;">
      <!-- Sidebar Filters Skeleton -->
      <aside class="search-filters" style="background: var(--bg-surface); padding: 24px; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); height: fit-content; display: flex; flex-direction: column; gap: 20px;">
        <div class="skeleton" style="height: 22px; width: 90px; margin-bottom: 8px; border-radius: var(--radius-sm);"></div>
        ${Array(4).fill(0).map(() => `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div class="skeleton" style="height: 14px; width: 60px; border-radius: var(--radius-xs);"></div>
            <div class="skeleton" style="height: 40px; width: 100%; border-radius: var(--radius-md);"></div>
          </div>
        `).join('')}
        <div class="skeleton" style="height: 44px; width: 100%; border-radius: var(--radius-lg); margin-top: 10px;"></div>
      </aside>

      <!-- Results Skeleton -->
      <div>
        <div class="search-results-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div class="skeleton" style="height: 18px; width: 180px; border-radius: var(--radius-sm);"></div>
          <div class="skeleton" style="height: 36px; width: 140px; border-radius: var(--radius-md);"></div>
        </div>
        <div class="property-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
          ${Array(4).fill(0).map(() => getSkeletonCardHTML()).join('')}
        </div>
      </div>
    </div>
  `;
}

export function getDetailSkeleton() {
  return `
    <div class="detail-view" style="max-width: 1200px; margin: 0 auto; padding: 24px 16px;">
      <!-- Back Button -->
      <div class="skeleton" style="height: 36px; width: 130px; margin-bottom: 20px; border-radius: var(--radius-md);"></div>

      <!-- Title & Subtitle -->
      <div class="skeleton" style="height: 32px; width: 60%; margin-bottom: 12px; border-radius: var(--radius-sm);"></div>
      <div style="display: flex; gap: 12px; margin-bottom: 24px;">
        <div class="skeleton" style="height: 16px; width: 220px; border-radius: var(--radius-sm);"></div>
        <div class="skeleton" style="height: 16px; width: 140px; border-radius: var(--radius-sm);"></div>
      </div>

      <!-- Gallery Grid Placeholders -->
      <div class="detail-gallery" style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 32px; aspect-ratio: 21/9; max-height: 480px; overflow: hidden; border-radius: var(--radius-xl);">
        <div class="skeleton" style="height: 100%; width: 100%;"></div>
        <div style="display: flex; flex-direction: column; gap: 12px; height: 100%;">
          <div class="skeleton" style="flex: 1; width: 100%;"></div>
          <div class="skeleton" style="flex: 1; width: 100%;"></div>
        </div>
      </div>

      <!-- Body Section -->
      <div class="detail-body" style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px;">
        <!-- Left details info -->
        <div class="detail-info" style="display: flex; flex-direction: column; gap: 28px;">
          <!-- Landlord Profile Box -->
          <div style="background: var(--bg-surface); padding: 20px; border-radius: var(--radius-lg); display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm);">
            <div class="skeleton" style="height: 52px; width: 52px; border-radius: var(--radius-full);"></div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
              <div class="skeleton" style="height: 16px; width: 150px; border-radius: var(--radius-sm);"></div>
              <div class="skeleton" style="height: 12px; width: 90px; border-radius: var(--radius-sm);"></div>
            </div>
            <div class="skeleton" style="height: 38px; width: 110px; border-radius: var(--radius-md);"></div>
          </div>

          <!-- Description Section -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="skeleton" style="height: 20px; width: 120px; border-radius: var(--radius-sm);"></div>
            <div class="skeleton" style="height: 14px; width: 100%; border-radius: var(--radius-xs);"></div>
            <div class="skeleton" style="height: 14px; width: 95%; border-radius: var(--radius-xs);"></div>
            <div class="skeleton" style="height: 14px; width: 80%; border-radius: var(--radius-xs);"></div>
          </div>

          <!-- Amenities Section -->
          <div>
            <div class="skeleton" style="height: 20px; width: 100px; margin-bottom: 16px; border-radius: var(--radius-sm);"></div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
              ${Array(6).fill(0).map(() => `<div class="skeleton" style="height: 18px; width: 140px; border-radius: var(--radius-sm);"></div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Right sidebar box -->
        <aside style="background: var(--bg-surface); padding: 24px; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); height: fit-content; display: flex; flex-direction: column; gap: 20px;">
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div class="skeleton" style="height: 12px; width: 50px; border-radius: var(--radius-xs);"></div>
            <div class="skeleton" style="height: 32px; width: 120px; border-radius: var(--radius-sm);"></div>
          </div>
          <div class="skeleton" style="height: 48px; width: 100%; border-radius: var(--radius-lg);"></div>
          <div class="skeleton" style="height: 48px; width: 100%; border-radius: var(--radius-lg);"></div>
        </aside>
      </div>
    </div>
  `;
}

export function getDashboardSkeleton() {
  return `
    <div class="dashboard" style="max-width: 1200px; margin: 0 auto; padding: 24px 16px;">
      <!-- Greeting Header -->
      <div style="margin-bottom: 32px;">
        <div class="skeleton" style="height: 36px; width: 280px; margin-bottom: 8px; border-radius: var(--radius-sm);"></div>
        <div class="skeleton" style="height: 16px; width: 340px; border-radius: var(--radius-sm);"></div>
      </div>

      <!-- Stats Cards Row -->
      <div class="dashboard-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px;">
        ${Array(4).fill(0).map(() => `
          <div class="stat-card" style="background: var(--bg-surface); padding: 20px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 8px;">
            <div class="skeleton" style="height: 36px; width: 36px; border-radius: var(--radius-md);"></div>
            <div class="skeleton" style="height: 28px; width: 60px; border-radius: var(--radius-sm);"></div>
            <div class="skeleton" style="height: 12px; width: 80px; border-radius: var(--radius-sm);"></div>
          </div>
        `).join('')}
      </div>

      <!-- Tabs Row -->
      <div class="dashboard-tabs" style="display: flex; gap: 16px; border-bottom: 2px solid var(--color-gray-100); padding-bottom: 12px; margin-bottom: 24px;">
        ${Array(4).fill(0).map(() => `<div class="skeleton" style="height: 24px; width: 110px; border-radius: var(--radius-sm);"></div>`).join('')}
      </div>

      <!-- Active Content Skeleton (e.g. Table layout) -->
      <div style="background: var(--bg-surface); padding: 24px; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-gray-100); padding-bottom: 12px; font-weight: bold;">
          ${Array(5).fill(0).map(() => `<div class="skeleton" style="height: 16px; width: 80px; border-radius: var(--radius-sm);"></div>`).join('')}
        </div>
        ${Array(4).fill(0).map(() => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--color-gray-50);">
            <div class="skeleton" style="height: 14px; width: 140px; border-radius: var(--radius-sm);"></div>
            <div class="skeleton" style="height: 14px; width: 80px; border-radius: var(--radius-sm);"></div>
            <div class="skeleton" style="height: 14px; width: 90px; border-radius: var(--radius-sm);"></div>
            <div class="skeleton" style="height: 14px; width: 60px; border-radius: var(--radius-sm);"></div>
            <div class="skeleton" style="height: 28px; width: 90px; border-radius: var(--radius-md);"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function getMessagesSkeleton() {
  return `
    <div style="display: grid; grid-template-columns: 320px 1fr; height: calc(100vh - 72px); max-height: 800px; max-width: 1200px; margin: 0 auto; border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-md); background: var(--bg-surface);">
      <!-- Left Inbox sidebar -->
      <div style="border-right: 1px solid var(--color-gray-100); display: flex; flex-direction: column;">
        <div style="padding: 20px; border-bottom: 1px solid var(--color-gray-100);">
          <div class="skeleton" style="height: 24px; width: 100px; border-radius: var(--radius-sm);"></div>
        </div>
        <div style="flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px;">
          ${Array(5).fill(0).map(() => `
            <div style="display: flex; gap: 12px; padding: 10px; border-radius: var(--radius-md);">
              <div class="skeleton" style="height: 40px; width: 40px; border-radius: var(--radius-full); flex-shrink: 0;"></div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                <div class="skeleton" style="height: 14px; width: 100px; border-radius: var(--radius-sm);"></div>
                <div class="skeleton" style="height: 11px; width: 140px; border-radius: var(--radius-sm);"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right Chat Pane -->
      <div style="display: flex; flex-direction: column; background: var(--bg-primary);">
        <!-- Active User Bar -->
        <div style="padding: 16px 24px; background: var(--bg-surface); border-bottom: 1px solid var(--color-gray-100); display: flex; align-items: center; gap: 12px;">
          <div class="skeleton" style="height: 36px; width: 36px; border-radius: var(--radius-full);"></div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div class="skeleton" style="height: 14px; width: 120px; border-radius: var(--radius-sm);"></div>
            <div class="skeleton" style="height: 10px; width: 60px; border-radius: var(--radius-sm);"></div>
          </div>
        </div>

        <!-- Chat history area -->
        <div style="flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto;">
          <div style="align-self: flex-start; display: flex; gap: 8px; max-width: 60%;">
            <div class="skeleton" style="height: 38px; width: 180px; border-radius: 18px 18px 18px 2px;"></div>
          </div>
          <div style="align-self: flex-end; max-width: 60%;">
            <div class="skeleton" style="height: 38px; width: 120px; border-radius: 18px 18px 2px 18px;"></div>
          </div>
          <div style="align-self: flex-start; display: flex; gap: 8px; max-width: 60%;">
            <div class="skeleton" style="height: 52px; width: 220px; border-radius: 18px 18px 18px 2px;"></div>
          </div>
          <div style="align-self: flex-end; max-width: 60%;">
            <div class="skeleton" style="height: 38px; width: 160px; border-radius: 18px 18px 2px 18px;"></div>
          </div>
        </div>

        <!-- Compose bar -->
        <div style="padding: 16px 24px; background: var(--bg-surface); border-top: 1px solid var(--color-gray-100); display: flex; gap: 12px; align-items: center;">
          <div class="skeleton" style="height: 40px; flex: 1; border-radius: var(--radius-lg);"></div>
          <div class="skeleton" style="height: 40px; width: 40px; border-radius: var(--radius-full);"></div>
        </div>
      </div>
    </div>
  `;
}

export function getGeneralSkeleton() {
  return `
    <div style="display:flex;align-items:center;justify-content:center;min-height:70vh;width:100%;">
      <div style="text-align:center;width:100%;max-width:400px;padding:24px;display:flex;flex-direction:column;gap:16px;">
        <div class="skeleton" style="height:48px;width:48px;border-radius:var(--radius-md);margin:0 auto;"></div>
        <div class="skeleton" style="height:20px;width:60%;margin:0 auto;border-radius:var(--radius-sm);"></div>
        <div class="skeleton" style="height:12px;width:100%;border-radius:var(--radius-xs);"></div>
        <div class="skeleton" style="height:12px;width:80%;margin:0 auto;border-radius:var(--radius-xs);"></div>
      </div>
    </div>
  `;
}
