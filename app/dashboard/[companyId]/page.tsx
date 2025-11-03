import { Button } from "@whop/react/components";
import { headers } from "next/headers";
import Link from "next/link";
import { whopsdk } from "@/lib/whop-sdk";
import Home from "./page-client";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  const { userId } = await whopsdk.verifyUserToken(await headers());

  // Fetch the neccessary data we want from whop.
  const [company, user, access] = await Promise.all([
    whopsdk.companies.retrieve(companyId),
    whopsdk.users.retrieve(userId),
    whopsdk.users.checkAccess(companyId, { id: userId }),
  ]);
	
  const displayName = user.name || `@${user.username}`;

  return (
    <>
      <Home
        access={access.access_level}
        userId={userId}
        username={user.username}
        name={user.name}
        companyId={companyId}
      />
    </>
  );
}

function JsonViewer({ data }: { data: any }) {
  return (
    <pre className="text-2 border border-gray-a4 rounded-lg p-4 bg-gray-a2 max-h-72 overflow-y-auto">
      <code className="text-gray-10">{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
}
