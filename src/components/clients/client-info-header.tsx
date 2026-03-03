import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Mail, Phone, MapPin, StickyNote } from "lucide-react";

interface ClientInfoHeaderProps {
  client: {
    name: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    isActive: boolean;
    notes: string | null;
    monthlyRetainer: number | null;
  };
}

export function ClientInfoHeader({ client }: ClientInfoHeaderProps) {
  const addressParts = [client.address, client.city, client.state, client.zip].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant={client.isActive ? "default" : "secondary"}>
              {client.isActive ? "Active" : "Inactive"}
            </Badge>
            {client.monthlyRetainer && client.monthlyRetainer > 0 && (
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                Retainer: {formatCurrency(client.monthlyRetainer)}/mo
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {client.contactName && (
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-md bg-gray-100 mt-0.5">
                <StickyNote className="h-3.5 w-3.5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contact</p>
                <p className="text-sm font-medium">{client.contactName}</p>
              </div>
            </div>
          )}

          {client.email && (
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-md bg-blue-50 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{client.email}</p>
              </div>
            </div>
          )}

          {client.phone && (
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-md bg-green-50 mt-0.5">
                <Phone className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{client.phone}</p>
              </div>
            </div>
          )}

          {fullAddress && (
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-md bg-orange-50 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">{fullAddress}</p>
              </div>
            </div>
          )}
        </div>

        {client.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
