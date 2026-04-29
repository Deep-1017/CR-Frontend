import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, ThumbsUp, ThumbsDown, Flag, ChevronLeft, ChevronRight, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductReviews, GetReviewsParams, voteReview } from "@/lib/api";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ReviewListProps {
  productId: string;
  onLoadComplete?: () => void;
}

interface ReviewUser {
  _id: string;
  name: string;
  avatar?: string;
}

interface Review {
  _id: string;
  userId: ReviewUser;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: string;
  helpful: number;
  notHelpful: number;
  helpfulVotes?: string[];
  notHelpfulVotes?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface AggregatedStats {
  average: number;
  total: number;
  distribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
}

interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  pagination: PaginationData;
  aggregatedStats: AggregatedStats;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
};

const ReviewCard = ({ review, onVoteUpdate }: { review: Review, onVoteUpdate?: (updatedReview: any) => void }) => {
  const { user, isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(false);
  
  // Calculate initial helpful status based on user's ID
  const initialStatus = user && review.helpfulVotes?.includes(user.id) 
    ? "helpful" 
    : user && review.notHelpfulVotes?.includes(user.id)
      ? "notHelpful"
      : null;
      
  const [helpfulStatus, setHelpfulStatus] = useState<"helpful" | "notHelpful" | null>(initialStatus);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful || 0);
  const [notHelpfulCount, setNotHelpfulCount] = useState(review.notHelpful || 0);

  const isLongComment = review.comment.length > 300;
  const displayComment = expanded || !isLongComment ? review.comment : `${review.comment.substring(0, 300)}...`;

  const handleHelpful = async (type: "helpful" | "notHelpful") => {
    if (!isAuthenticated) {
      toast.error("Please log in to vote on reviews.");
      return;
    }

    const newStatus = helpfulStatus === type ? null : type;
    
    // Optimistic update
    setHelpfulStatus(newStatus);
    
    // Calculate new counts for optimistic UI
    let newHelpfulCount = review.helpful || 0;
    let newNotHelpfulCount = review.notHelpful || 0;
    
    // Remove old vote
    if (helpfulStatus === "helpful") newHelpfulCount = Math.max(0, newHelpfulCount - 1);
    if (helpfulStatus === "notHelpful") newNotHelpfulCount = Math.max(0, newNotHelpfulCount - 1);
    
    // Add new vote
    if (newStatus === "helpful") newHelpfulCount += 1;
    if (newStatus === "notHelpful") newNotHelpfulCount += 1;
    
    setHelpfulCount(newHelpfulCount);
    setNotHelpfulCount(newNotHelpfulCount);

    try {
      const response = await voteReview(review.productId, review._id, newStatus);
      if (response.success && onVoteUpdate) {
        onVoteUpdate({ ...review, ...response.review });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to record vote.");
      // Revert optimistic update
      setHelpfulStatus(initialStatus);
      setHelpfulCount(review.helpful || 0);
      setNotHelpfulCount(review.notHelpful || 0);
    }
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(review.createdAt));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
            {review.userId?.avatar ? (
              <img
                src={review.userId.avatar}
                alt={review.userId.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              review.userId?.name?.charAt(0).toUpperCase() || "U"
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{review.userId?.name || "Anonymous User"}</span>
              {review.isVerifiedPurchase && (
                <span className="inline-flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> Verified Purchase
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              <StarRating rating={review.rating} />
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      <h4 className="mb-2 font-bold text-gray-900">{review.title}</h4>
      
      <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
        {displayComment}
        {isLongComment && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-1 font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        )}
      </p>

      {review.images && review.images.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {review.images.map((img, idx) => (
            <div key={idx} className="h-16 w-16 overflow-hidden rounded border border-gray-200 cursor-pointer hover:border-gray-400">
              <img src={img} alt="Review attachment" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="mr-1">Was this review helpful?</span>
          <button
            onClick={() => handleHelpful("helpful")}
            className={`flex items-center gap-1 rounded-full border px-3 py-1 transition-colors hover:bg-gray-50 ${
              helpfulStatus === "helpful" ? "border-gray-900 bg-gray-50 text-gray-900 font-medium" : "border-gray-200"
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${helpfulStatus === "helpful" ? "fill-current" : ""}`} /> 
            <span className="text-xs">{helpfulCount}</span>
          </button>
          <button
            onClick={() => handleHelpful("notHelpful")}
            className={`flex items-center gap-1 rounded-full border px-3 py-1 transition-colors hover:bg-gray-50 ${
              helpfulStatus === "notHelpful" ? "border-gray-900 bg-gray-50 text-gray-900 font-medium" : "border-gray-200"
            }`}
          >
            <ThumbsDown className={`h-4 w-4 ${helpfulStatus === "notHelpful" ? "fill-current" : ""}`} />
            <span className="text-xs">{notHelpfulCount}</span>
          </button>
        </div>
        
        <button className="ml-auto flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600">
          <Flag className="h-3 w-3" /> Report Review
        </button>
      </div>
    </div>
  );
};

export const ReviewList: React.FC<ReviewListProps> = ({ productId, onLoadComplete }) => {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [sortBy, setSortBy] = useState("recent");
  const [ratingFilter, setRatingFilter] = useState("all");

  const { data, isLoading, isError, error, refetch } = useQuery<ReviewsResponse, Error>({
    queryKey: ["reviews", productId, page, limit, sortBy, ratingFilter],
    queryFn: async () => {
      const params: GetReviewsParams = { page, limit, sortBy };
      if (ratingFilter !== "all") {
        params.rating = ratingFilter;
      }
      const response = await getProductReviews(productId, params);
      return response;
    },
    enabled: !!productId,
  });

  useEffect(() => {
    if (data && onLoadComplete) {
      onLoadComplete();
    }
  }, [data, onLoadComplete]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    document.getElementById("review-section-top")?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h3 className="mb-2 text-lg font-bold text-red-800">Failed to load reviews</h3>
        <p className="mb-4 text-sm text-red-600">
          {error?.message || "There was an error fetching the reviews. Please try again."}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="bg-white hover:bg-gray-50">
          Retry
        </Button>
      </div>
    );
  }

  const reviews = data?.reviews || [];
  const stats = data?.aggregatedStats;
  const pagination = data?.pagination;

  const totalReviewsCount = stats?.total || 0;
  const avgRating = stats?.average ? Number(stats.average.toFixed(1)) : 0;

  if (reviews.length === 0 && ratingFilter === "all") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
        <Star className="mb-4 h-12 w-12 text-gray-300" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">No reviews yet</h3>
        <p className="mb-4 text-sm text-gray-500">Be the first to review this product!</p>
        {isAuthenticated && (
          <WriteReviewModal
            productId={productId}
            trigger={
              <Button className="rounded-full bg-gray-900 px-6 text-white hover:bg-gray-800">
                Write a Review
              </Button>
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl" id="review-section-top">
      {/* Summary Section */}
      {stats && (
        <div className="mb-10 grid gap-8 rounded-xl border border-gray-200 bg-gray-50 p-6 md:grid-cols-12 md:p-8">
          <div className="flex flex-col items-center justify-center md:col-span-4 md:border-r md:border-gray-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Average Rating</h3>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-gray-900">{avgRating.toFixed(1)}</span>
              <span className="text-xl text-gray-400">/ 5.0</span>
            </div>
            <StarRating rating={Math.round(avgRating)} />
            <p className="mt-3 text-sm font-medium text-gray-600">Based on {totalReviewsCount} reviews</p>
          </div>
          
          <div className="md:col-span-8">
            <h4 className="mb-4 text-sm font-bold text-gray-900">Rating Distribution</h4>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats.distribution[stars.toString() as keyof typeof stats.distribution] || 0;
                const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
                
                return (
                  <div key={stars} className="flex items-center gap-3 text-sm">
                    <button 
                      onClick={() => setRatingFilter(stars.toString())}
                      className={`flex w-20 items-center gap-1 hover:underline ${ratingFilter === stars.toString() ? "font-bold text-gray-900" : "text-gray-600"}`}
                    >
                      <span className="w-2 text-right">{stars}</span>
                      <Star className={`h-3 w-3 ${ratingFilter === stars.toString() ? "fill-yellow-400 text-yellow-400" : "fill-current"}`} />
                    </button>
                    <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div 
                        className="absolute left-0 top-0 h-full rounded-full bg-yellow-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-24 text-right text-gray-500">
                      <span className="mr-2 font-medium text-gray-700">{count}</span>
                      ({percentage}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Controls & List */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900">
            {ratingFilter !== "all" ? `${ratingFilter}-Star Reviews` : "All Reviews"}
            <span className="ml-2 text-sm font-normal text-gray-500">({pagination?.totalCount || 0})</span>
          </h3>
          {isAuthenticated && (
            <WriteReviewModal
              productId={productId}
              trigger={
                <Button size="sm" variant="outline" className="rounded-full text-xs">
                  Write a Review
                </Button>
              }
            />
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {ratingFilter !== "all" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { setRatingFilter("all"); setPage(1); }}
              className="rounded-full text-xs"
            >
              Clear Filter
            </Button>
          )}
          
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="appearance-none rounded-full border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm font-medium text-gray-700 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating">Highest Rated</option>
              <option value="lowest_rated">Lowest Rated</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-12 text-center">
          <p className="text-gray-500">No reviews found matching your criteria.</p>
          <Button 
            variant="link" 
            onClick={() => setRatingFilter("all")}
            className="mt-2 text-blue-600"
          >
            View all reviews
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{(pagination.currentPage - 1) * pagination.limit + 1}</span> to <span className="font-medium text-gray-900">{Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}</span> of <span className="font-medium text-gray-900">{pagination.totalCount}</span> reviews
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              className="h-9 gap-1 rounded-full px-3"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            
            <div className="hidden gap-1 md:flex">
              {Array.from({ length: pagination.totalPages }).map((_, i) => {
                const pageNum = i + 1;
                // Show limited page numbers to avoid crowding
                if (
                  pageNum === 1 || 
                  pageNum === pagination.totalPages || 
                  Math.abs(pageNum - pagination.currentPage) <= 1
                ) {
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-9 w-9 p-0 ${pagination.currentPage === pageNum ? "bg-gray-900 hover:bg-gray-800" : ""}`}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                
                if (
                  (pageNum === 2 && pagination.currentPage > 3) ||
                  (pageNum === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
                ) {
                  return <span key={pageNum} className="flex h-9 w-9 items-center justify-center text-gray-400">...</span>;
                }
                
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              className="h-9 gap-1 rounded-full px-3"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
