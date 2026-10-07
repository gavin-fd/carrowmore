import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router';
import { createRoot } from 'react-dom/client';
import { LazyMotion, MotionConfig, domMax } from 'motion/react';
import { App } from '@/app';
import { TooltipProvider } from '@/components/ui/tooltip';
import '@/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Honour the OS setting: transform and layout animation stop, fades stay. */}
    <MotionConfig reducedMotion="user">
      {/* Animation and layout features, loaded once; `strict` keeps components on the light `m` API. */}
      <LazyMotion features={domMax} strict>
        <TooltipProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TooltipProvider>
      </LazyMotion>
    </MotionConfig>
  </StrictMode>,
);
