import MessageBlock from "@/app/messageBlock";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header>
        <MessageBlock></MessageBlock>
      </header>
      <div className="page">
        {children}
      </div>
    </>
  );
}