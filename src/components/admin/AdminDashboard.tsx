
import React from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import AdminStatsCards from './AdminStatsCards';
import AdminPlanDistribution from './AdminPlanDistribution';
import AdminUserManagement from './AdminUserManagement';
import AdminRevenueAnalytics from './AdminRevenueAnalytics';

const AdminDashboard = () => {
  const { 
    stats, 
    users, 
    revenueStats, 
    weeklyStats, 
    sendCanvasSetupEmail, 
    pauseAccount, 
    resumeAccount, 
    deleteAccount, 
    fetchAdminStats, 
    fetchUserList,
    fetchRevenueStats,
    fetchWeeklyStats
  } = useAdminData();

  const totalSubmissions = users.reduce((sum, user) => sum + user.total_submissions, 0);

  const handleRefreshData = () => {
    fetchAdminStats();
    fetchUserList();
    fetchRevenueStats();
    fetchWeeklyStats();
  };

  return (
    <div className="space-y-6">
      <AdminStatsCards stats={stats} totalSubmissions={totalSubmissions} />
      <AdminRevenueAnalytics revenueStats={revenueStats} weeklyStats={weeklyStats} />
      <AdminPlanDistribution users={users} />
      <AdminUserManagement 
        users={users} 
        onSendCanvasSetupEmail={sendCanvasSetupEmail}
        onPauseAccount={pauseAccount}
        onResumeAccount={resumeAccount}
        onDeleteAccount={deleteAccount}
        onRefreshData={handleRefreshData}
      />
    </div>
  );
};

export default AdminDashboard;
