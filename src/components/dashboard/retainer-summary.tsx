import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface RetainerClient {
  id: string;
  name: string;
  monthlyRetainer: number;
}

interface RetainerSummaryProps {
  clients: RetainerClient[];
  totalMonthlyRetainer: number;
}

export function RetainerSummary({ clients, totalMonthlyRetainer }: RetainerSummaryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Monthly Retainers</CardTitle>
        <div className="p-2 rounded-md bg-blue-50">
          <RefreshCw className="h-4 w-4 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            No retainer clients configured. Edit a client to set a monthly retainer amount.
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href="/clients"
                  className="text-blue-600 hover:underline truncate mr-2"
                >
                  {client.name}
                </Link>
                <span className="font-medium whitespace-nowrap">
                  {formatCurrency(client.monthlyRetainer)}/mo
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {clients.length > 0 && (
        <CardFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full text-sm">
            <span className="font-medium text-muted-foreground">Total</span>
            <span className="font-bold text-blue-600">
              {formatCurrency(totalMonthlyRetainer)}/mo
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
