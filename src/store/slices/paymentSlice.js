import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const getAuthHeaders = () => {
  const authData = JSON.parse(localStorage.getItem("auth"));
  const token = authData?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createPaymentOrder = createAsyncThunk(
  "payment/createOrder",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(
        "http://localhost:4000/api/payments/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  "payment/verify",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:4000/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify payment");

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    status: "idle",
    error: null,
    order: null,
    key: null,
    paymentId: null,
    verification: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.order = action.payload.order;
        state.key = action.payload.key;
        state.paymentId = action.payload.paymentId;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.verification = action.payload;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default paymentSlice.reducer;
