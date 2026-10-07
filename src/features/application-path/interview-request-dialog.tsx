import type { ComponentProps } from 'react';
import interviewCheck from '@/assets/interview-request-check.svg';
import interviewClose from '@/assets/interview-request-close.svg';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';
import { SuccessDialog } from '@/components/ui/success-dialog';

type InterviewRequestDialogProps = Pick<
  ComponentProps<typeof SuccessDialog>,
  'open' | 'onOpenChange' | 'onCloseAutoFocus'
>;

/** The Figma interview confirmation, using the existing modal and success animations. */
export function InterviewRequestDialog(props: InterviewRequestDialogProps) {
  return (
    <SuccessDialog
      {...props}
      className="h-[min(512px,calc(100dvh-32px))] w-[min(844px,calc(100vw-32px))]"
      title="Interview request sent"
      description="Your request is now with the redeployment team. They’ll check that everything is in place and, if it is, put you forward to the employer. You’ll see any updates in your application tracker."
      icon={<img src={interviewCheck} width={48} height={48} alt="" />}
      closeButtonClassName="top-8 right-8"
      closeIcon={<img src={interviewClose} width={24} height={24} alt="" />}
      action={
        <Button asChild variant="neutral">
          <a href={routes.applicationTracker}>Track my application</a>
        </Button>
      }
    />
  );
}
