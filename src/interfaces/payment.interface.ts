export interface IPaymentCreate {
  amount: number;
  userId: number;
  description: string;
}

export interface IPaymentResponse {
  paymentUrl: string;
  paymentId: string;
}

export interface IPaymentStatus {
  status: "pending" | "completed" | "failed";
  paymentId: string;
}
