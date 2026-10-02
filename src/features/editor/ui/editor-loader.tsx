'use client';

import dynamic from 'next/dynamic';

export const EditorLoader = dynamic(() => import('@/features/editor/ui/editor-shell'), { ssr: false });
