import LoginClient from "./LoginClient";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const next = sp.next || "/";

  return <LoginClient next={next} />;
}