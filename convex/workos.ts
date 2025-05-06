import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import WorkOS from "@workos-inc/node";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Initialize WorkOS client
const workos = new WorkOS(process.env.WORKOS_API_KEY);

// Query to get user data
export const getUser = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    const userId = args.userId || identity.tokenIdentifier;
    
    // Query the users table to get the user data
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), userId))
      .first();
    
    return user;
  },
});

// Mutation to create or update user on login
export const createOrUpdateUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), args.tokenIdentifier))
      .first();

    if (existingUser) {
      // Update existing user
      return await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        pictureUrl: args.pictureUrl,
        organizationId: args.organizationId,
      });
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        tokenIdentifier: args.tokenIdentifier,
        email: args.email,
        name: args.name,
        pictureUrl: args.pictureUrl,
        organizationId: args.organizationId,
      });
    }
  },
});

// Mutation to generate WorkOS authentication URL
export const generateAuthUrl = mutation({
  args: {
    provider: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, args) => {
    const authorizationUrl = workos.sso.getAuthorizationURL({
      provider: args.provider,
      redirectURI: args.redirectUri,
    });
    
    return authorizationUrl;
  },
});

// Mutation to handle WorkOS authentication callback
export const handleAuthCallback = mutation({
  args: {
    code: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, args) => {
    // Exchange the code for a user profile
    const { user } = await workos.sso.getProfileAndToken({
      code: args.code,
      redirectURI: args.redirectUri,
    });
    
    if (!user || !user.email) {
      throw new Error("Failed to authenticate with WorkOS");
    }
    
    // Create or update the user in the database
    const tokenIdentifier = `workos:${user.id}`;
    
    await ctx.scheduler.runAfter(0, internal.workos.createOrUpdateUser, {
      tokenIdentifier,
      email: user.email,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.email.split('@')[0],
      pictureUrl: user.profilePictureURL,
    });
    
    // Return the session token
    const session = await ctx.auth.createSession({
      tokenIdentifier,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    });
    
    return {
      sessionId: session.sessionId,
      sessionToken: session.token,
      user: {
        id: user.id,
        email: user.email,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.email.split('@')[0],
        pictureUrl: user.profilePictureURL,
      }
    };
  },
});

// Mutation to create an organization
export const createOrganization = mutation({
  args: {
    name: v.string(),
    domain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Create organization in WorkOS
    const organization = await workos.organizations.createOrganization({
      name: args.name,
      domains: args.domain ? [args.domain] : undefined,
    });
    
    // Create organization in database
    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      domain: args.domain,
      workosId: organization.id,
      createdAt: new Date().toISOString(),
    });
    
    // Update the user with the new organization
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();
    
    if (user) {
      await ctx.db.patch(user._id, {
        organizationId: orgId,
      });
    }
    
    return {
      _id: orgId,
      name: args.name,
      domain: args.domain,
      workosId: organization.id,
    };
  },
});

// Query to get current user's organization
export const getUserOrganization = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();
    
    if (!user || !user.organizationId) {
      return null;
    }
    
    const organization = await ctx.db.get(user.organizationId as Id<"organizations">);
    return organization;
  },
}); 