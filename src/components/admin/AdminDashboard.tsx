
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
    resetUserUsage,
    fetchAdminStats, 
    fetchUserList,
    fetchRevenueStats,
    fetchWeeklyStats
  } = useAdminData();

  // Debug logging to see what data we have
  console.log('AdminDashboard - revenueStats:', revenueStats);
  console.log('AdminDashboard - weeklyStats:', weeklyStats);

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
        onResetUsage={resetUserUsage}
        onRefreshData={handleRefreshData}
      />
    </div>
  );
};

export default AdminDashboard;
