import React from 'react';

function OptionCard({ title, description, imageSrc, onClick }) {
  return (
    <div 
      className="w-full max-w-[350px] bg-white rounded-[24px] shadow-md p-6 cursor-pointer
                 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="flex justify-center mb-4">
        <img 
          src={imageSrc} 
          alt={title}
          className="w-24 h-24 object-contain"
        />
      </div>

      {/* Content */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#3b2f78] mb-2">
          {title}
        </h2>
        <p className="text-[#555] text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

export default OptionCard; 