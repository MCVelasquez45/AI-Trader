// 🚀 Performance monitoring utilities for React components

// 📊 Component render counter
const renderCounts: Record<string, number> = {};

// 🔍 Track component renders
export const trackRender = (componentName: string) => {
  renderCounts[componentName] = (renderCounts[componentName] || 0) + 1;
  
  if (renderCounts[componentName] > 10) {
    console.warn(`⚠️ [Performance] ${componentName} has rendered ${renderCounts[componentName]} times - consider optimization`);
  }
  
  return renderCounts[componentName];
};

// 📈 Performance measurement utility
export const measurePerformance = <T extends (...args: any[]) => any>(
  name: string,
  fn: T,
  ...args: Parameters<T>
): ReturnType<T> => {
  const start = performance.now();
  const result = fn(...args);
  const end = performance.now();
  
  if (end - start > 16) { // 16ms = 60fps threshold
    console.warn(`⚠️ [Performance] ${name} took ${(end - start).toFixed(2)}ms - consider optimization`);
  }
  
  return result;
};

// 🧹 Reset render counts (useful for development)
export const resetRenderCounts = () => {
  Object.keys(renderCounts).forEach(key => delete renderCounts[key]);
  console.log('🧹 Render counts reset');
};

// 📊 Get current render statistics
export const getRenderStats = () => {
  return { ...renderCounts };
};

// 🔍 Debug component props changes
export const debugProps = (componentName: string, prevProps: any, nextProps: any) => {
  const changedProps: Record<string, { prev: any; next: any }> = {};
  
  Object.keys(nextProps).forEach(key => {
    if (prevProps[key] !== nextProps[key]) {
      changedProps[key] = {
        prev: prevProps[key],
        next: nextProps[key]
      };
    }
  });
  
  if (Object.keys(changedProps).length > 0) {
    console.log(`🔍 [${componentName}] Props changed:`, changedProps);
  }
  
  return changedProps;
};

