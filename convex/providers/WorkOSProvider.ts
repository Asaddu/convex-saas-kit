import type { ProviderConfig } from "@auth/core/providers";
import WorkOS from "@workos-inc/node";

export interface WorkOSProviderProps {
  clientId?: string;
  redirectUri?: string;
  connection?: string;
  organization?: string;
  provider?: string;
}

export const WorkOSProvider = {
  id: "workos",
  type: "oauth",
  name: "WorkOS",
  authorization: {
    url: "https://api.workos.com/sso/authorize",
    params: {
      scope: "openid profile email",
      response_type: "code",
    },
  },
  token: {
    url: "https://api.workos.com/sso/token",
    async request({ params, provider }) {
      const workos = new WorkOS(process.env.WORKOS_API_KEY || "");
      
      const { access_token, profile } = await workos.sso.getProfileAndToken({
        code: params.code,
        clientId: provider.clientId || "",
      });
      
      return {
        tokens: { access_token },
        profile,
      };
    },
  },
  userinfo: {
    async request({ tokens, provider }) {
      // We already have the profile from the token request
      return tokens.profile;
    },
  },
  profile(profile) {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.firstName && profile.lastName 
        ? `${profile.firstName} ${profile.lastName}` 
        : (profile.email ? profile.email.split("@")[0] : profile.id),
      image: profile.profilePictureUrl,
    };
  },
  options: {
    clientId: "",
    redirectUri: "",
    connection: "",
    organization: "",
    provider: "",
  },
} satisfies ProviderConfig; 