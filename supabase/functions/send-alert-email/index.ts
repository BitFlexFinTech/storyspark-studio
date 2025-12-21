import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertEmailRequest {
  userId: string;
  notification: {
    title: string;
    message: string;
    notification_type: string;
    data?: Record<string, any>;
  };
  competitorName?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, notification, competitorName }: AlertEmailRequest = await req.json();

    console.log(`Sending alert email to user ${userId} for: ${notification.title}`);

    // Get user email from Supabase auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      console.error("Failed to get user email:", userError);
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userEmail = userData.user.email;
    const appUrl = Deno.env.get("APP_URL") || "https://lovable.dev";

    // Get notification icon based on type
    const getIconAndColor = (type: string) => {
      switch (type) {
        case "new_video":
          return { icon: "🎬", color: "#3B82F6" };
        case "milestone":
          return { icon: "🏆", color: "#10B981" };
        case "trending":
          return { icon: "🔥", color: "#F59E0B" };
        default:
          return { icon: "🔔", color: "#8B5CF6" };
      }
    };

    const { icon, color } = getIconAndColor(notification.notification_type);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #141414; border-radius: 16px; overflow: hidden; border: 1px solid #262626;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${color}22, ${color}11); padding: 32px 40px; border-bottom: 1px solid #262626;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size: 32px; margin-right: 12px;">${icon}</span>
                    <span style="font-size: 24px; font-weight: 700; color: #ffffff;">${notification.title}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                ${notification.message}
              </p>
              
              ${competitorName ? `
              <div style="background-color: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #262626;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0 0 4px 0;">Competitor</p>
                <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0;">${competitorName}</p>
              </div>
              ` : ''}
              
              ${notification.data?.videoTitle ? `
              <div style="background-color: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #262626;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0 0 4px 0;">Video</p>
                <p style="color: #ffffff; font-size: 16px; margin: 0;">${notification.data.videoTitle}</p>
                ${notification.data.views ? `<p style="color: ${color}; font-size: 14px; margin: 8px 0 0 0;">${notification.data.views.toLocaleString()} views</p>` : ''}
              </div>
              ` : ''}
              
              <a href="${appUrl}/notifications" style="display: inline-block; background-color: ${color}; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                View in Dashboard
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #0d0d0d; border-top: 1px solid #262626;">
              <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
                You're receiving this because you enabled email notifications for competitor alerts.
                <br><br>
                <a href="${appUrl}/competitors" style="color: #9ca3af; text-decoration: underline;">Manage notification settings</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Competitor Alerts <alerts@resend.dev>",
        to: [userEmail],
        subject: `${icon} ${notification.title}`,
        html: htmlContent,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, id: emailData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-alert-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
