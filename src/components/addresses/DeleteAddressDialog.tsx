import type { Address } from "@/services/addressService";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: Address | null;
  isDeleting?: boolean;
  onConfirmDelete: (addressId: string) => void | Promise<void>;
};

const formatSummary = (address: Address) => {
  const line2 = address.addressLine2?.trim();
  const parts = [
    address.fullName,
    address.phone,
    address.addressLine1,
    line2 ? line2 : null,
    `${address.city}, ${address.state} ${address.zipCode}`,
    address.country,
  ].filter(Boolean);
  return parts.join(", ");
};

export default function DeleteAddressDialog({
  open,
  onOpenChange,
  address,
  isDeleting,
  onConfirmDelete,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this address?</AlertDialogTitle>
          <AlertDialogDescription>
            {address ? (
              <span className="text-sm text-muted-foreground">{formatSummary(address)}</span>
            ) : (
              "This action cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              disabled={!address || isDeleting}
              onClick={() => {
                if (!address) return;
                onConfirmDelete(address._id);
              }}
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

