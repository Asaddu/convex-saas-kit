import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Handle user creation event from WorkOS
 */
export const handleUserCreated = internalMutation({
  args: {
    user: v.any()
  },
  handler: async (ctx, args) => {
    const { user } = args;
    
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), `workos:${user.id}`))
      .first();
    
    if (existingUser) {
      // Update user if they already exist
      return await ctx.db.patch(existingUser._id, {
        email: user.email,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.email.split('@')[0],
        pictureUrl: user.profilePictureUrl,
      });
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        tokenIdentifier: `workos:${user.id}`,
        email: user.email,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.email.split('@')[0],
        pictureUrl: user.profilePictureUrl,
      });
    }
  },
});

/**
 * Handle user update event from WorkOS
 */
export const handleUserUpdated = internalMutation({
  args: {
    user: v.any()
  },
  handler: async (ctx, args) => {
    const { user } = args;
    
    // Find the user in our database
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), `workos:${user.id}`))
      .first();
    
    if (existingUser) {
      // Update user
      return await ctx.db.patch(existingUser._id, {
        email: user.email,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.email.split('@')[0],
        pictureUrl: user.profilePictureUrl,
      });
    }
    
    // If user doesn't exist, create them
    return await ctx.db.insert("users", {
      tokenIdentifier: `workos:${user.id}`,
      email: user.email,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.email.split('@')[0],
      pictureUrl: user.profilePictureUrl,
    });
  },
});

/**
 * Handle connection creation from WorkOS (e.g., new SSO connection)
 */
export const handleConnectionCreated = internalMutation({
  args: {
    connection: v.any()
  },
  handler: async (ctx, args) => {
    const { connection } = args;
    
    // Store connection information if needed
    console.log("New connection created in WorkOS:", connection);
    
    // Additional processing can be done here if needed
    return null;
  },
});

/**
 * Handle organization creation from WorkOS
 */
export const handleOrganizationCreated = internalMutation({
  args: {
    organization: v.any()
  },
  handler: async (ctx, args) => {
    const { organization } = args;
    
    // Check if organization already exists
    const existingOrg = await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("workosId"), organization.id))
      .first();
    
    if (existingOrg) {
      // Update organization if it already exists
      return await ctx.db.patch(existingOrg._id, {
        name: organization.name,
        domain: organization.domains?.[0]?.domain,
        logoUrl: organization.logoUrl,
      });
    } else {
      // Create new organization
      return await ctx.db.insert("organizations", {
        name: organization.name,
        domain: organization.domains?.[0]?.domain,
        workosId: organization.id,
        createdAt: new Date().toISOString(),
        logoUrl: organization.logoUrl,
      });
    }
  },
});

/**
 * Handle organization update from WorkOS
 */
export const handleOrganizationUpdated = internalMutation({
  args: {
    organization: v.any()
  },
  handler: async (ctx, args) => {
    const { organization } = args;
    
    // Find the organization in our database
    const existingOrg = await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("workosId"), organization.id))
      .first();
    
    if (existingOrg) {
      // Update organization
      return await ctx.db.patch(existingOrg._id, {
        name: organization.name,
        domain: organization.domains?.[0]?.domain,
        logoUrl: organization.logoUrl,
      });
    }
    
    // If organization doesn't exist, create it
    return await ctx.db.insert("organizations", {
      name: organization.name,
      domain: organization.domains?.[0]?.domain,
      workosId: organization.id,
      createdAt: new Date().toISOString(),
      logoUrl: organization.logoUrl,
    });
  },
});

/**
 * Handle organization deletion from WorkOS
 */
export const handleOrganizationDeleted = internalMutation({
  args: {
    organization: v.any()
  },
  handler: async (ctx, args) => {
    const { organization } = args;
    
    // Find the organization in our database
    const existingOrg = await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("workosId"), organization.id))
      .first();
    
    if (existingOrg) {
      // Find all users in this organization
      const users = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("organizationId"), existingOrg._id))
        .collect();
      
      // Update all users to remove organization reference
      for (const user of users) {
        await ctx.db.patch(user._id, {
          organizationId: undefined,
        });
      }
      
      // Delete the organization
      await ctx.db.delete(existingOrg._id);
    }
    
    return null;
  },
}); 