import React, { useState, useEffect } from 'react';

const ReviewImageModal = ({ review, isOpen, onClose }) => {
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    if (review && review.images && review.images.length > 0) {
      setMainImage(review.images[0]);
    }
  }, [review]);

  if (!isOpen || !review) {
    return null;
  }

  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    return "Today";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl flex max-w-4xl w-full h-3/4 relative border border-gray-200">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-3xl z-10">&times;</button>
        <div className="w-2/3 bg-black flex flex-col justify-center items-center p-4">
          <img src={mainImage} alt="Main review" className="max-h-[80%] max-w-full object-contain" />
          <div className="flex mt-4 space-x-2">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 ${mainImage === image ? 'border-blue-500' : 'border-transparent'}`}
                onClick={() => setMainImage(image)}
              />
            ))}
          </div>
        </div>
        <div className="w-1/3 p-6 overflow-y-auto">
            <div className="flex items-center mb-2">
                <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-sm flex items-center">
                  {review.rating} <i className="fas fa-star text-xs ml-1"></i>
                </span>
                <p className="font-semibold ml-3 text-gray-800">{review.comment.substring(0, 30)}...</p> 
            </div>
            <p className="text-gray-700 text-sm mb-4">{review.comment}</p>
            <div className="flex items-center text-xs text-gray-500">
                <span>{review.userId.name}</span>
                <i className="fas fa-check-circle text-gray-400 mx-2"></i>
                <span>Certified Buyer, {timeSince(review.createdAt)}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewImageModal;
