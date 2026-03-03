import { Header } from "@/components/layout/header";
import { VendorTable } from "@/components/vendors/vendor-table";
import { VendorFormDialog } from "@/components/vendors/vendor-form-dialog";
import { getVendors } from "./actions";
import { Card, CardContent } from "@/components/ui/card";

export default async function VendorsPage() {
  const vendors = await getVendors();

  return (
    <>
      <Header title="Vendors">
        <VendorFormDialog />
      </Header>
      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            <VendorTable vendors={vendors} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
