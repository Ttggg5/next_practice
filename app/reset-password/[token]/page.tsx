import ResetPassword from "./reset-password";

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params;

  return (
    <ResetPassword token={token as string}></ResetPassword>
  );
}