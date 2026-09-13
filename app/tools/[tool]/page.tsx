import { notFound } from "next/navigation";
import { AuthorityLayerApp } from "../../page";
import { TOOL_VIEWS } from "../../route-config";

type Props = { params: Promise<{ tool: string }> };

export function generateStaticParams() {
  return Object.keys(TOOL_VIEWS).map(tool => ({ tool }));
}

export default async function ToolPage({ params }: Props) {
  const { tool } = await params;
  const initialView = TOOL_VIEWS[tool as keyof typeof TOOL_VIEWS];
  if (!initialView) notFound();
  return <AuthorityLayerApp initialView={initialView} />;
}
