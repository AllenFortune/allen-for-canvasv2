
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  full_name?: string;
}

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const getFirstName = (fullName?: string) => {
    if (!fullName) return null;
    return fullName.split(' ')[0];
  };

  const getDisplayName = () => {
    if (profileLoading) return "...";
    
    const firstName = getFirstName(profile?.full_name);
    return firstName || user?.email || "User";
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleAuthAction = async () => {
    if (user) {
      setSigningOut(true);
      try {
        await signOut();
        // Clear profile state immediately after sign out
        setProfile(null);
        toast({
          title: "Signed out successfully",
          description: "You have been logged out of your account.",
        });
        navigate('/');
      } catch (error) {
        console.error('Sign out error in header:', error);
        toast({
          title: "Signed out",
          description: "You have been logged out of your account.",
        });
        navigate('/');
      } finally {
        setSigningOut(false);
      }
    } else {
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/lovable-uploads/82237aca-ea13-4bc4-b27b-75d688d97a7f.png" 
                alt="A.L.L.E.N. Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-xl font-bold text-gray-900">A.L.L.E.N.</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-20 h-10 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <img 
              src="/lovable-uploads/82237aca-ea13-4bc4-b27b-75d688d97a7f.png" 
              alt="A.L.L.E.N. Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="text-xl font-bold text-gray-900">A.L.L.E.N.</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            Home
          </Link>
          <Link to="/ai-pedagogy" className="text-gray-600 hover:text-gray-900 transition-colors">
            AI Literacy
          </Link>
          <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
            Pricing
          </Link>
          <Link to="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
            Features
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">
                Welcome, {getDisplayName()}
              </span>
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={handleAuthAction}
                disabled={signingOut}
              >
                {signingOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleAuthAction}>
                Login
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
