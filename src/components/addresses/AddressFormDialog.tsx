import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Address } from "@/services/addressService";
import { INDIAN_STATES } from "@/services/addressService";
import { addressFormSchema, type AddressFormValues } from "@/components/addresses/addressSchema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialAddress?: Address | null;
  isSubmitting?: boolean;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
  onDeleteClick?: (() => void) | undefined;
};

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

export default function AddressFormDialog({
  open,
  onOpenChange,
  mode,
  initialAddress,
  isSubmitting,
  onSubmit,
  onDeleteClick,
}: Props) {
  const defaultValues = useMemo<AddressFormValues>(() => {
    if (mode === "edit" && initialAddress) {
      return {
        label: initialAddress.label ?? "",
        fullName: initialAddress.fullName ?? "",
        phone: initialAddress.phone ?? "",
        addressLine1: initialAddress.addressLine1 ?? "",
        addressLine2: initialAddress.addressLine2 ?? "",
        city: initialAddress.city ?? "",
        state: initialAddress.state,
        zipCode: initialAddress.zipCode ?? "",
        country: "India",
        isDefault: initialAddress.isDefault ?? false,
      };
    }

    return {
      label: "",
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "Karnataka",
      zipCode: "",
      country: "India",
      isDefault: false,
    };
  }, [initialAddress, mode]);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues);
  }, [defaultValues, form, open]);

  const title = mode === "add" ? "Add New Address" : "Edit Address";
  const description =
    mode === "add"
      ? "Save a new shipping address to use at checkout."
      : "Update your saved address details.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({
                ...values,
                phone: normalizeDigits(values.phone),
                zipCode: normalizeDigits(values.zipCode),
              });
            })}
            className="space-y-4"
            noValidate
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Home / Work" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="10-digit number"
                        {...field}
                        onChange={(e) => field.onChange(normalizeDigits(e.target.value).slice(0, 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="6-digit pin code"
                        {...field}
                        onChange={(e) => field.onChange(normalizeDigits(e.target.value).slice(0, 6))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input placeholder="House no, street, area" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Landmark, apartment, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input readOnly {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Set as Default</FormLabel>
                    <p className="text-sm text-muted-foreground">Use this address as your default for checkout.</p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              {mode === "edit" && typeof onDeleteClick === "function" && (
                <Button
                  type="button"
                  variant="destructive"
                  className="sm:mr-auto"
                  onClick={onDeleteClick}
                  disabled={isSubmitting}
                >
                  Delete Address
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {mode === "add" ? "Save Address" : "Update Address"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

