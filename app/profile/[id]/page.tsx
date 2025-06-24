import ProfileView from "./profile-view";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  return (
    <ProfileView userId={id as string}></ProfileView>
  );
}