import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, MoveRight, PackageCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { readLastOrderSnapshot } from "@/lib/lastOrder";

const AccountOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const lastOrder = useMemo(() => readLastOrderSnapshot(), []);
  const canOpenLastOrder =
    Boolean(lastOrder) && lastOrder?.email === user?.email.trim().toLowerCase();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Header />
      <main className="container mx-auto px-4 py-10 md:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-[28px] border border-stone-200 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(28,25,23,0.06)] md:px-8">
            <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Orders</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
              Your order hub
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
              Detailed order history is still being expanded. Your most recent confirmed order is
              available below, and you can continue shopping any time.
            </p>
          </section>

          <Card className="border-stone-200 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stone-900">
                <PackageCheck className="h-5 w-5 text-emerald-600" />
                Latest order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-stone-600">
              {canOpenLastOrder && lastOrder ? (
                <>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Order ID</p>
                    <p className="mt-2 break-all text-base font-medium text-stone-900">
                      {lastOrder.orderId}
                    </p>
                  </div>
                  <Button
                    className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => navigate(`/order-confirmation/${lastOrder.orderId}`)}
                  >
                    Open latest order
                    <MoveRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center">
                  <ClipboardList className="mx-auto h-8 w-8 text-stone-400" />
                  <p className="mt-3 text-base font-medium text-stone-900">No recent order found</p>
                  <p className="mt-1 text-sm text-stone-500">
                    Once you complete checkout, your latest order will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              className="rounded-full bg-stone-900 text-white hover:bg-stone-800"
              onClick={() => navigate("/shop")}
            >
              Continue Shopping
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-stone-300 text-stone-700 hover:bg-stone-100"
              onClick={() => navigate("/account")}
            >
              Back to Account
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountOrders;
