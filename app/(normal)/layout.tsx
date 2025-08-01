import MessageBlock from "@/app/messageBlock";
import SearchBar from "@/app/searchBar";
import Title from "@/app/title";
import PageNavBar from "@/app/(normal)/pageNavBar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header>
        <Title></Title>
        <MessageBlock></MessageBlock>
        <SearchBar></SearchBar>
      </header>
      <div className="page">
        {children}
      </div>
      <PageNavBar></PageNavBar>
    </>
  );
}