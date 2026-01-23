/**
 * LinkedIn Service
 * Handles OAuth flow and API interactions for real LinkedIn integration.
 */

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_API_URL = "https://api.linkedin.com/v2";

export interface LinkedInConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface LinkedInProfile {
  id: string;
  localizedFirstName: string;
  localizedLastName: string;
  profilePicture?: {
    "displayImage~": {
      elements: Array<{
        identifiers: Array<{
          identifier: string;
        }>;
      }>;
    };
  };
}

/**
 * Generates the OAuth authorization URL
 */
export function getLinkedInAuthUrl(clientId: string, redirectUri: string): string {
  const scope = "w_member_social profile openid email"; // Updated scopes for v2
  const state = Math.random().toString(36).substring(7); // Simple state for CSRF protection
  
  // Store state in localStorage to verify later
  if (typeof window !== "undefined") {
    localStorage.setItem("linkedin_auth_state", state);
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state: state,
    scope: scope,
  });

  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

/**
 * Mock function to simulate posting to LinkedIn
 * (Used when keys are set to 'demo' or actual API call fails)
 */
export async function mockPostToLinkedIn(text: string): Promise<{ success: boolean; id: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        id: "urn:li:share:" + Math.random().toString(36).substring(7),
      });
    }, 1500);
  });
}

/**
 * Checks if the user is "connected" (has a valid token)
 */
export function isLinkedInConnected(): boolean {
  if (typeof window === "undefined") return false;
  // In a real app, check token expiration
  return !!localStorage.getItem("strategyos_linkedin_token");
}

/**
 * Disconnects LinkedIn
 */
export function disconnectLinkedIn() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("strategyos_linkedin_token");
  }
}
