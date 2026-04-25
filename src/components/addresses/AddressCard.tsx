import type { Address } from "@/services/addressService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Props = {
  address: Address;
  isSettingDefault?: boolean;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
  onSetDefault: (addressId: string) => void;
};

const formatAddressLines = (address: Address) => {
  const line2 = address.addressLine2?.trim();
  return [
    address.addressLine1,
    line2 ? line2 : null,
    `${address.city}, ${address.state} ${address.zipCode}`,
    address.country,
  ].filter(Boolean);
};

export default function AddressCard({
  address,
  isSettingDefault,
  onEdit,
  onDelete,
  onSetDefault,
}: Props) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold truncate">{address.label}</h3>
              {address.isDefault && <Badge variant="secondary">Default</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{address.fullName}</p>
            <p className="text-sm text-muted-foreground">{address.phone}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(address)}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(address)}>
              Delete
            </Button>
            {!address.isDefault && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onSetDefault(address._id)}
                disabled={isSettingDefault}
              >
                Set as Default
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {formatAddressLines(address).map((line) => (
          <p key={line} className="text-sm text-muted-foreground">
            {line}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

