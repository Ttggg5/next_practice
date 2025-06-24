import VerifyEmail from "./verify-email";


export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params;

  return (
    <VerifyEmail token={token as string}></VerifyEmail>
  );
}