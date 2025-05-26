
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to your Dashboard</h1>
              <p className="text-xl text-gray-600">
                Hello {user?.email}! Your Canvas integration and grading dashboard will be available here.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Canvas Setup</h3>
                <p className="text-gray-600 mb-4">Connect your Canvas instance to start using A.L.L.E.N.</p>
                <button className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Setup Canvas →
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Grading</h3>
                <p className="text-gray-600 mb-4">Grade assignments with AI assistance.</p>
                <button className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Coming Soon
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sync Grades</h3>
                <p className="text-gray-600 mb-4">Push grades and feedback back to Canvas.</p>
                <button className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
