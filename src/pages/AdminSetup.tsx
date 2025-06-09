
import React from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSetup from '@/components/admin/AdminSetup';

const AdminSetupPage = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Setup</h1>
              <p className="text-xl text-gray-600">Configure administrative access</p>
            </div>
            <AdminSetup />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminSetupPage;
