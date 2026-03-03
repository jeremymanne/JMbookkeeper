import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Activity, FileText, ArrowDownUp } from "lucide-react";

type ActivityItem =
  | { type: "invoice"; date: Date; id: string; label: string; amount: number; status: string }
  | { type: "transaction"; date: Date; id: string; label: string; amount: number; txnType: string };

interface ClientActivityFeedProps {
  activity: ActivityItem[];
}

export function ClientActivityFeed({ activity }: ClientActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No activity yet.
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-start gap-3">
                <div
                  className={`p-1.5 rounded-md mt-0.5 ${
                    item.type === "invoice" ? "bg-blue-50" : "bg-gray-100"
                  }`}
                >
                  {item.type === "invoice" ? (
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                  ) : (
                    <ArrowDownUp className="h-3.5 w-3.5 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={
                      item.type === "invoice"
                        ? `/invoices/${item.id}`
                        : `/transactions/${item.id}/edit`
                    }
                    className="text-sm font-medium text-blue-600 hover:underline truncate block"
                  >
                    {item.label}
                  </Link>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.date)}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        item.type === "invoice"
                          ? item.status === "paid"
                            ? "text-green-600"
                            : "text-orange-600"
                          : item.txnType === "income"
                            ? "text-green-600"
                            : "text-red-600"
                      }`}
                    >
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
