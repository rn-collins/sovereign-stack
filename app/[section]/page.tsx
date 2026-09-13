import { notFound } from "next/navigation";
import { AuthorityLayerApp } from "../page";
import { SECTION_VIEWS } from "../route-config";

type Props = { params: Promise<{ section: string }> };

export function generateStaticParams() {
  return Object.keys(SECTION_VIEWS).map(section => ({ section }));
}

export default async function SectionPage({ params }: Props) {
  const { section } = await params;
  const initialView = SECTION_VIEWS[section as keyof typeof SECTION_VIEWS];
  if (!initialView) notFound();
  return <AuthorityLayerApp initialView={initialView} />;
}
