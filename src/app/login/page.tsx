import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { SetupPasswordForm } from "@/components/auth/setup-password-form";
import { isPasswordSet } from "./actions";

export default async function LoginPage() {
  const hasPassword = await isPasswordSet();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-slate-900 p-3 rounded-xl">
              <BookOpen className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-xl">
            {hasPassword ? "Welcome Back" : "Welcome to BookKeeper"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasPassword ? <LoginForm /> : <SetupPasswordForm />}
        </CardContent>
      </Card>
    </div>
  );
}
