import React, { Profiler } from 'react';

interface PerformanceProfilerProps {
  id: string;
  children: React.ReactNode;
  enabled?: boolean;
}

const PerformanceProfiler: React.FC<PerformanceProfilerProps> = ({ 
  id, 
  children, 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  if (!enabled) {
    return <>{children}</>;
  }

  const handleProfilerRender = (
    id: string,
    phase: string,
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    // 🚨 Log slow renders
    if (actualDuration > 16) { // 16ms = 60fps threshold
      console.warn(`⚠️ [Performance] ${id} took ${actualDuration.toFixed(2)}ms (${phase})`);
    }
    
    // 📊 Log all renders in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 [Profiler] ${id}: ${phase} - ${actualDuration.toFixed(2)}ms`);
    }
  };

  return (
    <Profiler id={id} onRender={handleProfilerRender}>
      {children}
    </Profiler>
  );
};

export default PerformanceProfiler;

