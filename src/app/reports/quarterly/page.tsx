"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

export default function QuarterlyExportPage() {
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

  const [year, setYear] = useState(String(currentYear));
  const [quarter, setQuarter] = useState(String(currentQuarter));
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/export?year=${year}&quarter=${quarter}`
      );
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Q${quarter}-${year}-bookkeeper-export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download export. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  return (
    <>
      <Header title="Quarterly Export" />
      <div className="p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">
              Export Quarterly Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download a CSV export of all transactions for a specific quarter.
              Share this with your accountant for quarterly review.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quarter</Label>
                <Select value={quarter} onValueChange={setQuarter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1 (Jan - Mar)</SelectItem>
                    <SelectItem value="2">Q2 (Apr - Jun)</SelectItem>
                    <SelectItem value="3">Q3 (Jul - Sep)</SelectItem>
                    <SelectItem value="4">Q4 (Oct - Dec)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading ? "Preparing..." : "Download CSV Export"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
