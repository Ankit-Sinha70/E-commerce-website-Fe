import React from 'react';

const RatingsSummary = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const totalReviews = reviews.length;
  const averageRating = (reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1);

  const ratingCounts = {
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0,
  };

  reviews.forEach(review => {
    if (ratingCounts[review.rating] !== undefined) {
      ratingCounts[review.rating]++;
    }
  });

  const ratingDistribution = Object.keys(ratingCounts).sort((a, b) => b - a).map(star => ({
    star: parseInt(star),
    count: ratingCounts[star],
    percentage: totalReviews > 0 ? (ratingCounts[star] / totalReviews) * 100 : 0,
  }));

  const getBarColor = (star) => {
    if (star >= 4) return 'bg-green-500';
    if (star >= 2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-start p-4 border-b max-w-3xl">
      <div className="mr-8">
        <div className="flex items-center text-3xl font-bold text-yellow-500">
          {averageRating} <i className="fas fa-star text-xl ml-1"></i>
        </div>
        <p className="text-gray-300">{totalReviews} Ratings & Reviews</p>
      </div>
      <div className="flex-grow">
        {ratingDistribution.map(({ star, count, percentage }) => (
          <div key={star} className="flex items-center space-x-2 text-sm">
            <span className="w-8 text-right">{star} ★</span>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`${getBarColor(star)} h-1.5 rounded-full`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="w-10 text-left text-gray-300">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingsSummary;
