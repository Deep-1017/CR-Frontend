import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : "CR";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Header />
      <main className="container mx-auto px-4 py-10 md:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(28,25,23,0.06)] md:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border border-stone-200">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-stone-100 text-lg font-semibold text-stone-700">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Account</p>
                  <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
                    {user?.name || "Your profile"}
                  </h1>
                  <p className="mt-1 text-sm text-stone-500">
                    Signed in with {user?.provider || "your account"}.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-full border-stone-300 text-stone-700 hover:bg-stone-100"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
            <div className="mt-5">
              <Button
                variant="outline"
                className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => navigate("/account/orders")}
              >
                View My Orders
              </Button>
            </div>
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            <Card className="border-stone-200 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stone-900">
                  <UserRound className="h-4 w-4" />
                  Profile details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-stone-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Full name</p>
                  <p className="mt-1 text-base font-medium text-stone-900">{user?.name || "Not available"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Email</p>
                  <p className="mt-1 text-base font-medium text-stone-900">{user?.email || "Not available"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stone-900">
                  <ShieldCheck className="h-4 w-4" />
                  Account status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-stone-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Role</p>
                  <p className="mt-1 text-base font-medium capitalize text-stone-900">{user?.role || "User"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-400">Provider</p>
                  <p className="mt-1 text-base font-medium capitalize text-stone-900">{user?.provider || "Local"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-stone-200 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-900">
                <Mail className="h-4 w-4" />
                What works now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-stone-600">
              <p>The header profile control now opens a real account menu instead of sending every signed-in user back to the login page.</p>
              <p>Your account page is protected, so it only opens for authenticated users and gives you a clear place to verify profile details or log out.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Account;
