import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <div className="font-mono text-[64px] leading-none text-[#d7c9b0]">404</div>
        <h1 className="mt-3 font-serif text-[20px]">这一页还没有写。</h1>
        <p className="mt-2 text-[11px] text-muted-foreground">回到工作台，继续从声音开始。</p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-2 rounded-[3px] border border-border bg-card px-4 py-2 text-[11px] hover:border-[#b9a98d]"
        >
          <ArrowLeft className="size-3.5" /> 返回工作台
        </Link>
      </div>
    </div>
  );
}
