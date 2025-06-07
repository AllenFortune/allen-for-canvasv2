
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLogEntry {
  id: string;
  action: string;
  table_name: string | null;
  created_at: string;
}

const SecurityStatusCard: React.FC = () => {
  const { user } = useAuth();
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentLogs = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('id, action, table_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching audit logs:', error);
        } else {
          setRecentLogs(data || []);
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentLogs();
  }, [user]);

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('FAILED') || action.includes('ERROR')) {
      return 'destructive';
    } else if (action.includes('LIMIT_REACHED')) {
      return 'secondary';
    }
    return 'default';
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-600" />
          Security Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Security Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Row Level Security</span>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Active
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Audit Logging</span>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Enabled
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Data Encryption</span>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Protected
            </Badge>
          </div>

          {/* Recent Activity */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              Recent Security Events
            </h4>
            
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
              </div>
            ) : recentLogs.length > 0 ? (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={getActionBadgeVariant(log.action)}
                        className="text-xs px-1 py-0"
                      >
                        {formatAction(log.action)}
                      </Badge>
                      {log.table_name && (
                        <span className="text-gray-500">on {log.table_name}</span>
                      )}
                    </div>
                    <span className="text-gray-400">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityStatusCard;
