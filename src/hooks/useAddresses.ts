import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address, CreateAddressInput, UpdateAddressInput } from "@/services/addressService";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "@/services/addressService";

export const addressKeys = {
  all: ["addresses"] as const,
};

export const useAddresses = (enabled: boolean = true) => {
  return useQuery({
    queryKey: addressKeys.all,
    queryFn: listAddresses,
    staleTime: 30_000,
    retry: 1,
    enabled,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation<Address, unknown, CreateAddressInput>({
    mutationFn: createAddress,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation<Address, unknown, { addressId: string; payload: UpdateAddressInput }>({
    mutationFn: ({ addressId, payload }) => updateAddress(addressId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, unknown, { addressId: string }>({
    mutationFn: ({ addressId }) => deleteAddress(addressId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation<Address, unknown, { addressId: string }>({
    mutationFn: ({ addressId }) => setDefaultAddress(addressId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
};

