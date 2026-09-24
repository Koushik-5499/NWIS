import React from 'react';

const PageContainer = ({ children }) => {
  return (
    <main className="flex-1 overflow-y-auto bg-[#F7F7F7] dark:bg-[#121212] transition-colors duration-200">
      <div className="p-6 max-w-[1400px] mx-auto">
        {children}
      </div>
    </main>
  );
};

export default PageContainer;
