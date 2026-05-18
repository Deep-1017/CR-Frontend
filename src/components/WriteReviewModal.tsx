import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createProductReview, updateReview } from "@/lib/api";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().min(10, "Title must be at least 10 characters").max(200, "Title must be less than 200 characters"),
  comment: z.string().min(20, "Comment must be at least 20 characters").max(2000, "Comment must be less than 2000 characters"),
  images: z.array(z.string().url("Image must be a valid URL")).max(3, "Maximum 3 images allowed").optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface WriteReviewModalProps {
  productId: string;
  trigger?: React.ReactNode;
  reviewId?: string;
  editMode?: boolean;
  initialData?: {
    rating: number;
    title: string;
    comment: string;
  };
  onSuccess?: (review: unknown) => void;
}

export function WriteReviewModal({
  productId,
  trigger,
  reviewId,
  editMode = false,
  initialData,
  onSuccess,
}: WriteReviewModalProps) {
  const [open, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: initialData?.rating ?? 0,
      title: initialData?.title ?? "",
      comment: initialData?.comment ?? "",
      images: [],
    },
  });

  const commentValue = watch("comment");

  useEffect(() => {
    if (open && editMode && initialData) {
      reset({
        rating: initialData.rating,
        title: initialData.title,
        comment: initialData.comment,
        images: [],
      });
    }
  }, [editMode, initialData, open, reset]);

  const mutation = useMutation({
    mutationFn: (data: ReviewFormValues) => {
      if (editMode) {
        if (!reviewId) {
          throw new Error("Review ID is required to update a review.");
        }
        return updateReview(reviewId, data);
      }

      return createProductReview(productId, data);
    },
    onSuccess: (response) => {
      const updatedReview = response?.review || response?.data || response;
      onSuccess?.(updatedReview);

      if (editMode) {
        toast({
          title: "Review updated",
          description: "Your review has been updated.",
        });
        setOpen(false);
        return;
      }

      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      toast({
        title: "Review submitted",
        description: "Your review is pending approval.",
      });
    },
    onError: (error: unknown) => {
      const message = isAxiosError(error) 
        ? error.response?.data?.message || "Something went wrong. Please try again."
        : "An unexpected error occurred.";
      toast({
        title: editMode ? "Error updating review" : "Error submitting review",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    mutation.mutate(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !isAuthenticated) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        reset({
          rating: editMode ? (initialData?.rating ?? 0) : 0,
          title: editMode ? (initialData?.title ?? "") : "",
          comment: editMode ? (initialData?.comment ?? "") : "",
          images: [],
        });
        setIsSuccess(false);
        mutation.reset();
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Write a Review</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Star className="h-8 w-8 fill-current" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Thank you!</h2>
            <p className="mb-6 text-gray-500">
              Your review has been submitted and is pending approval. It will appear on the site shortly.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => setOpen(false)} className="bg-gray-900 text-white">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editMode ? "Edit Your Review" : "Share Your Thoughts"}
              </DialogTitle>
              <DialogDescription>
                {editMode
                  ? "Update your review for this product."
                  : "Write a review for this product to help other customers."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-6">
              {/* Rating */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">Overall Rating <span className="text-red-500">*</span></label>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              star <= field.value ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200 hover:text-yellow-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating.message}</p>}
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">Review Title <span className="text-red-500">*</span></label>
                <Input
                  {...register("title")}
                  placeholder="Summarize your experience"
                  className="w-full"
                  maxLength={200}
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
              </div>

              {/* Comment */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-900">Review Detail <span className="text-red-500">*</span></label>
                  <span className="text-xs text-gray-500">{commentValue.length}/2000</span>
                </div>
                <Textarea
                  {...register("comment")}
                  placeholder="What did you like or dislike? What should other shoppers know before buying?"
                  className="min-h-[120px] w-full resize-y"
                  maxLength={2000}
                />
                {errors.comment && <p className="mt-1 text-xs text-red-500">{errors.comment.message}</p>}
              </div>

              {/* Upload Images (Optional/Mock) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">Add Images (Optional)</label>
                <div className="flex flex-wrap gap-3">
                  <Controller
                    name="images"
                    control={control}
                    render={({ field }) => (
                      <>
                        {field.value?.map((url, idx) => (
                          <div key={idx} className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-200">
                            <img src={url} alt="Upload preview" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => field.onChange(field.value?.filter((_, i) => i !== idx))}
                              className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {(field.value?.length || 0) < 3 && (
                          <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100">
                            <Upload className="h-5 w-5" />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                // Mock upload - in a real app, upload to Cloudinary and get URL back
                                const file = e.target.files?.[0];
                                if (file) {
                                  const tempUrl = URL.createObjectURL(file);
                                  field.onChange([...(field.value || []), tempUrl]);
                                }
                                e.target.value = ''; // Reset input
                              }}
                            />
                          </label>
                        )}
                      </>
                    )}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Upload up to 3 images showing the product.</p>
                {errors.images && <p className="mt-1 text-xs text-red-500">{errors.images.message}</p>}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending} className="bg-gray-900 text-white hover:bg-gray-800">
                  {mutation.isPending
                    ? (editMode ? "Updating..." : "Submitting...")
                    : (editMode ? "Update Review" : "Submit Review")}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
