import { ReactNode } from 'react';

interface ActionsLayoutProps {
  children: ReactNode;
}

export default function ActionsLayout({ children }: ActionsLayoutProps) {
  return <div className="container mx-auto py-6">{children}</div>;
}
