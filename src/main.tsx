import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router';
import { createRoot } from 'react-dom/client';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { App } from '@/app';
import { TooltipProvider } from '@/components/ui/tooltip';
import '@/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Honour the OS setting: transform and layout animation stop, fades stay. */}
    <MotionConfig reducedMotion="user">
      {/* Animation features only, loaded once; `strict` keeps components on the light `m` API. */}
      <LazyMotion features={domAnimation} strict>
        <TooltipProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TooltipProvider>
      </LazyMotion>
    </MotionConfig>
  </StrictMode>,
);
