import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterBusiness from './pages/auth/RegisterBusiness';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import StockAlerts from './pages/inventory/StockAlerts';
import Billing from './pages/Billing';
import InvoiceList from './pages/billing/InvoiceList';
import InvoiceView from './pages/billing/InvoiceView';
import Customers from './pages/Customers';
import Accounting from './pages/Accounting';
import Settings from './pages/Settings';
import StaffManagement from './pages/settings/StaffManagement';
import SubscriptionPlans from './pages/settings/SubscriptionPlans';
import TenantSettings from './pages/settings/TenantSettings';
import Profile from './pages/auth/Profile';

import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-business" element={<RegisterBusiness />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/add" element={<ProductForm />} />
              <Route path="/products/edit/:id" element={<ProductForm />} />
              <Route path="/products/alerts" element={<StockAlerts />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/billing/history" element={<InvoiceList />} />
              <Route path="/billing/invoice/:id" element={<InvoiceView />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/staff" element={<StaffManagement />} />
              <Route path="/settings/subscription" element={<SubscriptionPlans />} />
              <Route path="/settings/tenant" element={<TenantSettings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
