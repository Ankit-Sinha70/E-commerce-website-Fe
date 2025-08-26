import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReview } from '../../features/review/reviewSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReviewForm = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const dispatch = useDispatch();

  const { accessToken } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessToken) {
      toast.info('Please sign in to submit a review.', {
        className: "toast-info"
      });
      return;
    }

    if (rating <= 0) {
      toast.warn('Please provide a rating.', {
        className: "toast-warning"
      });
      return;
    }

    try {
      await dispatch(createReview({ productId, rating, comment, images })).unwrap();
      toast.success('Review submitted successfully', {
        className: "toast-success",
        autoClose: 3000
      });
      setRating(0);
      setComment('');
      setImages([]);
    } catch (err) {
      const message = (err && err.message) || 'Failed to submit review';
      toast.error(message, {
        className: "toast-danger",
        autoClose: 3000
      });
      console.error('createReview error', err);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast.warn('You can upload up to 5 images. Extra files were ignored.', {
        className:"toast-warning"
      });
      setImages(files.slice(0, 5));
      return;
    }
    setImages(files);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-300">Write a Review</h2>
      {accessToken ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="block text-gray-300 mb-2">Rating</label>
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
            <label className="block text-gray-300">Comment</label>
            <textarea
              className="w-full p-2 border rounded text-white"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">Images</label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="w-full p-2 border rounded text-white"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Submit Review
          </button>
        </form>
      ) : (
        <p>
          Please{' '}
          <a
            href="/login"
            className="text-blue-500"
            onClick={() => toast.info('You need to sign in to write a review')}
          >
            sign in
          </a>{' '}
          to write a review.
        </p>
      )}
    </div>
  );
};

export default ReviewForm;
