import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddressCard from "@/components/addresses/AddressCard";
import AddressFormDialog from "@/components/addresses/AddressFormDialog";
import DeleteAddressDialog from "@/components/addresses/DeleteAddressDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from "@/hooks/useAddresses";
import type { Address } from "@/services/addressService";
import type { AddressFormValues } from "@/components/addresses/addressSchema";

const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const msg =
      (error.response?.data as { message?: string; error?: string } | undefined)?.message ??
      (error.response?.data as { message?: string; error?: string } | undefined)?.error;
    return msg ?? "Something went wrong. Please try again.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
};

export default function AddressBook() {
  const { data: addresses, isLoading, isError, error } = useAddresses();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteState, setDeleteState] = useState<{ open: boolean; address: Address | null }>({
    open: false,
    address: null,
  });
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    setDefaultMutation.isPending;

  const sortedAddresses = useMemo(() => {
    if (!addresses) return [];
    return [...addresses].sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [addresses]);

  const openEdit = (address: Address) => {
    setEditingAddress(address);
    setIsEditOpen(true);
  };

  const openDelete = (address: Address) => {
    setDeleteState({ open: true, address });
  };

  const closeDelete = () => setDeleteState({ open: false, address: null });

  const handleAdd = async (values: AddressFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast({ title: "Address added successfully" });
      setIsAddOpen(false);
    } catch (e) {
      toast({
        title: "Unable to add address",
        description: getApiErrorMessage(e),
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (values: AddressFormValues) => {
    if (!editingAddress) return;
    try {
      await updateMutation.mutateAsync({ addressId: editingAddress._id, payload: values });
      toast({ title: "Address updated successfully" });
      setIsEditOpen(false);
      setEditingAddress(null);
    } catch (e) {
      toast({
        title: "Unable to update address",
        description: getApiErrorMessage(e),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      await deleteMutation.mutateAsync({ addressId });
      toast({ title: "Address deleted" });
      closeDelete();
      if (editingAddress?._id === addressId) {
        setIsEditOpen(false);
        setEditingAddress(null);
      }
    } catch (e) {
      toast({
        title: "Unable to delete address",
        description: getApiErrorMessage(e),
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultMutation.mutateAsync({ addressId });
      toast({ title: "Default address updated" });
    } catch (e) {
      toast({
        title: "Unable to set default address",
        description: getApiErrorMessage(e),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Address Book</h1>
            <p className="text-sm text-muted-foreground">Manage saved addresses for faster checkout.</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} disabled={isMutating}>
            Add New
          </Button>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-8 w-28" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-lg border p-6">
              <p className="font-semibold">Unable to load addresses</p>
              <p className="text-sm text-muted-foreground mt-1">{getApiErrorMessage(error)}</p>
            </div>
          ) : sortedAddresses.length === 0 ? (
            <div className="rounded-lg border p-8 text-center">
              <p className="font-semibold">No addresses saved yet. Add one now.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Save your shipping details to checkout faster next time.
              </p>
              <Button className="mt-4" onClick={() => setIsAddOpen(true)}>
                Add Address
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedAddresses.map((addr) => (
                <AddressCard
                  key={addr._id}
                  address={addr}
                  isSettingDefault={setDefaultMutation.isPending}
                  onEdit={openEdit}
                  onDelete={openDelete}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AddressFormDialog
        open={isAddOpen}
        onOpenChange={(o) => setIsAddOpen(o)}
        mode="add"
        isSubmitting={createMutation.isPending}
        onSubmit={handleAdd}
      />

      <AddressFormDialog
        open={isEditOpen}
        onOpenChange={(o) => {
          setIsEditOpen(o);
          if (!o) setEditingAddress(null);
        }}
        mode="edit"
        initialAddress={editingAddress}
        isSubmitting={updateMutation.isPending || deleteMutation.isPending}
        onSubmit={handleUpdate}
        onDeleteClick={() => {
          if (!editingAddress) return;
          setIsEditOpen(false);
          openDelete(editingAddress);
        }}
      />

      <DeleteAddressDialog
        open={deleteState.open}
        onOpenChange={(o) => {
          if (!o) closeDelete();
        }}
        address={deleteState.address}
        isDeleting={deleteMutation.isPending}
        onConfirmDelete={handleDelete}
      />
    </div>
  );
}

