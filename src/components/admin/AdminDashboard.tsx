
import React from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import AdminStatsCards from './AdminStatsCards';
import AdminPlanDistribution from './AdminPlanDistribution';
import AdminUserManagement from './AdminUserManagement';

const AdminDashboard = () => {
  const { stats, users, sendCanvasSetupEmail, pauseAccount, resumeAccount, fetchAdminStats, fetchUserList } = useAdminData();

  const totalSubmissions = users.reduce((sum, user) => sum + user.total_submissions, 0);

  const handleRefreshData = () => {
    fetchAdminStats();
    fetchUserList();
  };

  return (
    <div className="space-y-6">
      <AdminStatsCards stats={stats} totalSubmissions={totalSubmissions} />
      <AdminPlanDistribution users={users} />
      <AdminUserManagement 
        users={users} 
        onSendCanvasSetupEmail={sendCanvasSetupEmail}
        onPauseAccount={pauseAccount}
        onResumeAccount={resumeAccount}
        onRefreshData={handleRefreshData}
      />
    </div>
  );
};

export default AdminDashboard;
