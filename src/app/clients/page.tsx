import { Header } from "@/components/layout/header";
import { ClientTable } from "@/components/clients/client-table";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { getClients } from "./actions";
import { Card, CardContent } from "@/components/ui/card";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <>
      <Header title="Clients">
        <ClientFormDialog />
      </Header>
      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            <ClientTable clients={clients} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
