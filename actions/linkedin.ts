"use server";

export async function exchangeCodeForToken(
    code: string, 
    redirectUri: string, 
    clientId: string, 
    clientSecret: string
): Promise<{ access_token: string; expires_in: number } | { error: string }> {
    try {
        const params = new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
        });

        const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("LinkedIn Token Exchange Error:", data);
            return { error: data.error_description || "Failed to exchange code for token" };
        }

        return {
            access_token: data.access_token,
            expires_in: data.expires_in,
        };

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        console.error("LinkedIn Exchange Logic Error:", e);
        return { error: message };
    }
}
