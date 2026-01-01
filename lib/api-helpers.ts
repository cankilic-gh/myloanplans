import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Get user email from header (set by client)
  const userEmail = request.headers.get("x-user-email");
  
  if (!userEmail) {
    return null;
  }

  // Try to get user from Prisma database (for backward compatibility)
  if (prisma) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true },
      });
      
      if (user) {
        return user.id;
      }
      
      // If user doesn't exist in Prisma, try to get from Supabase Auth
      // and create in Prisma if found
      try {
        const supabase = createSupabaseAdmin();
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const authUser = authUsers?.users.find(u => u.email === userEmail);
        
        if (authUser) {
          // User exists in Supabase Auth but not in Prisma - create in Prisma
          const newUser = await prisma.user.create({
            data: {
              email: userEmail,
              name: authUser.user_metadata?.name || userEmail.split("@")[0],
              emailVerified: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at) : null,
            },
            select: { id: true },
          });
          return newUser.id;
        }
      } catch (supabaseError) {
        console.error("Error checking Supabase Auth:", supabaseError);
      }
      
      // If user doesn't exist anywhere, create them in Prisma (for development)
      // This handles the case where user signed up but database wasn't properly synced
      try {
        const newUser = await prisma.user.create({
          data: {
            email: userEmail,
            name: userEmail.split("@")[0], // Use email prefix as name
          },
          select: { id: true },
        });
        return newUser.id;
      } catch (createError) {
        console.error("Error creating user:", createError);
        // Fallback: use email as userId for development
        return userEmail;
      }
    } catch (error) {
      console.error("Error getting user from database:", error);
      // Fallback: use email as userId for development when database is unavailable
      return userEmail;
    }
  }

  // Fallback: use email as userId for development when Prisma is unavailable
  return userEmail;
}

