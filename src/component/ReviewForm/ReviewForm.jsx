import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReview } from '../../features/review/reviewSlice';

const ReviewForm = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const dispatch = useDispatch();

  const { accessToken } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createReview({ productId, rating, comment, images }));
    setRating(0);
    setComment('');
    setImages([]);
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Write a Review</h2>
      {accessToken ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Rating</label>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} onClick={() => setRating(i + 1)} className="cursor-pointer">
                  <i
                    className={`text-3xl ${i < rating ? 'fas fa-star text-yellow-500' : 'far fa-star text-yellow-500'}`}
                  ></i>
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Comment</label>
            <textarea
              className="w-full p-2 border rounded"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Images</label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Submit Review
          </button>
        </form>
      ) : (
        <p>Please <a href="/login" className="text-blue-500">sign in</a> to write a review.</p>
      )}
    </div>
  );
};

export default ReviewForm;
