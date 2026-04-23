import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OrderContextType {
  confirmedOrderId: string | null;
  setConfirmedOrderId: (orderId: string | null) => void;
  clearConfirmedOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  const clearConfirmedOrder = () => {
    setConfirmedOrderId(null);
  };

  return (
    <OrderContext.Provider
      value={{
        confirmedOrderId,
        setConfirmedOrderId,
        clearConfirmedOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};