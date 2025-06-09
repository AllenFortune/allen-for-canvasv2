
import React from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { useAdminData } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle } from 'lucide-react';

const AdminPortal = () => {
  const { isAdmin, loading } = useAdminData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-2xl mx-auto px-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Access Denied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You don't have permission to access the admin portal. This area is restricted to authorized administrators only.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-indigo-600" />
              <h1 className="text-4xl font-bold text-gray-900">Admin Portal</h1>
            </div>
            <p className="text-xl text-gray-600">Monitor user activity and Canvas integrations</p>
          </div>
          
          <AdminDashboard />
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
