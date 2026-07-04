import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Local typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthClient = {
  getAuthorizationDetails: (
    id: string
  ) => Promise<{ data: any; error: { message: string } | null }>;
  approveAuthorization: (
    id: string
  ) => Promise<{ data: any; error: { message: string } | null }>;
  denyAuthorization: (
    id: string
  ) => Promise<{ data: any; error: { message: string } | null }>;
};

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const oauth = (supabase.auth as unknown as { oauth: OAuthClient }).oauth;
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const oauth = (supabase.auth as unknown as { oauth: OAuthClient }).oauth;
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authorize access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">
              Could not process this authorization request: {error}
            </p>
          )}
          {!error && !details && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!error && details && (
            <>
              <p className="text-sm">
                Connect <span className="font-semibold">{details.client?.name ?? "an app"}</span> to your Allen for Canvas account?
              </p>
              <p className="text-sm text-muted-foreground">
                This lets {details.client?.name ?? "the client"} call Allen tools on your behalf, including reading your Canvas courses and assignments.
              </p>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => decide(true)} disabled={busy} className="flex-1">
                  Approve
                </Button>
                <Button onClick={() => decide(false)} disabled={busy} variant="outline" className="flex-1">
                  Deny
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default OAuthConsent;
