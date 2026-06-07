import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import type { User } from "@prisma/client";
import { isClerkConfigured, isDatabaseConfigured } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

type CurrentUserResult =
  | {
      status: "auth-not-configured" | "signed-out" | "database-not-configured";
      clerkUser: Awaited<ReturnType<typeof currentUser>> | null;
      dbUser: null;
    }
  | {
      status: "ready" | "database-error";
      clerkUser: Awaited<ReturnType<typeof currentUser>>;
      dbUser: User | null;
    };

export async function getCurrentUser(): Promise<CurrentUserResult> {
  if (!isClerkConfigured()) {
    return { status: "auth-not-configured", clerkUser: null, dbUser: null };
  }

  const { userId } = await auth();

  if (!userId) {
    return { status: "signed-out", clerkUser: null, dbUser: null };
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { status: "signed-out", clerkUser: null, dbUser: null };
  }

  if (!isDatabaseConfigured()) {
    return { status: "database-not-configured", clerkUser, dbUser: null };
  }

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;

  try {
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: primaryEmail,
        imageUrl: clerkUser.imageUrl,
      },
      create: {
        clerkId: userId,
        name: clerkUser.fullName,
        email: primaryEmail,
        imageUrl: clerkUser.imageUrl,
      },
    });

    return { status: "ready", clerkUser, dbUser };
  } catch {
    return { status: "database-error", clerkUser, dbUser: null };
  }
}
