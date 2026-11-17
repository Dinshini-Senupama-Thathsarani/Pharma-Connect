import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from '../features/auth/authSlice';
import medicineReducer from '../features/medicines/medicineSlice';
import orderReducer from '../features/orders/orderSlice';
import pharmacyReducer from '../features/pharmacies/pharmacySlice';

export const store = configureStore({
  reducer: { auth: authReducer, medicines: medicineReducer, pharmacies: pharmacyReducer, orders: orderReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
