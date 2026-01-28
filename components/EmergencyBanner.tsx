
import React from 'react';

const EmergencyBanner: React.FC = () => {
  return (
    <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-10 animate-pulse">
      <div className="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <span className="font-bold text-sm sm:text-base">校內緊急救援專線：</span>
          <a href="tel:0229052999" className="font-bold text-lg hover:underline">(02) 2905-2999</a>
        </div>
      </div>
      <div className="hidden sm:block text-xs opacity-90 italic">
        * 若有意識不清、呼吸困難，請立即撥打！
      </div>
    </div>
  );
};

export default EmergencyBanner;
