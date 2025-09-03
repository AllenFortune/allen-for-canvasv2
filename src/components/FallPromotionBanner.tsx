import { useState, useEffect } from "react";
import { GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FallPromotionBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check URL parameters for testing override
    const urlParams = new URLSearchParams(window.location.search);
    const showBanner = urlParams.get('showBanner');
    
    if (showBanner === 'true') {
      localStorage.removeItem("fall2025-banner-dismissed");
      setIsVisible(true);
      return;
    }

    // Check if user has dismissed the banner
    const isDismissed = localStorage.getItem("fall2025-banner-dismissed");
    console.log("Banner dismissed status:", isDismissed);
    
    if (isDismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("fall2025-banner-dismissed", "true");
  };

  const handleClaimDiscount = () => {
    navigate("/pricing");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-60 overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-transparent to-amber-600/20" />
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div>
                <h3 className="text-lg font-bold">Welcome Back for Fall 2025!</h3>
                <p className="text-sm text-orange-100">
                  Get 1 month of Lite Plan FREE with code <span className="font-semibold bg-white/20 px-2 py-1 rounded">ALLEN2025</span>
                </p>
              </div>
              <Button
                onClick={handleClaimDiscount}
                variant="secondary"
                className="bg-white text-orange-600 hover:bg-orange-50 font-semibold whitespace-nowrap"
              >
                Claim Your Discount
              </Button>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 flex-shrink-0"
            aria-label="Dismiss promotion banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FallPromotionBanner;