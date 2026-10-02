import { EditorLoader } from '@/features/editor/ui/editor-loader';

export default async function EditorPage({ params }: PageProps<'/editor/[id]'>) {
  const { id } = await params;
  return <EditorLoader projectId={id} />;
}
