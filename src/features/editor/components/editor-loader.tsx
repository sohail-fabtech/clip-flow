'use client';

import dynamic from 'next/dynamic';

export const EditorLoader = dynamic(() => import('./editor'), { ssr: false });
