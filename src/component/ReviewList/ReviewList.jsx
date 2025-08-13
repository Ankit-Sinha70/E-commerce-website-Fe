import React, { useState } from 'react';
import ReviewImageModal from '@/component/ReviewImageModal/ReviewImageModal';

const ReviewList = ({ reviews }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const openModal = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="mt-4">
      {reviews.length === 0 ? (
        <p className="text-center text-gray-300">No reviews yet. Be the first to review!</p>
      ) : (
        <div>
          {reviews.map((review) => (
            <div key={review._id} className="border-b py-4">
              <div className="flex items-center mb-2">
                <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-sm flex items-center">
                  {review.rating} <i className="fas fa-star text-xs ml-1"></i>
                </span>
                <p className="font-semibold ml-3 text-gray-300">{review.comment.substring(0, 30)}...</p> 
              </div>
              <p className="text-gray-300 text-sm mb-3">{review.comment}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {review.images && review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-md cursor-pointer"
                    onClick={() => openModal(review)}
                  />
                ))}
              </div>
              <div className="flex items-center text-xs text-gray-300">
                <span>{review.userId.name}</span>
                <i className="fas fa-check-circle text-gray-300 mx-2"></i>
                <span>Certified Buyer</span>
                <span className="mx-2">•</span>
                <span>{timeSince(review.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <ReviewImageModal review={selectedReview} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default ReviewList;
