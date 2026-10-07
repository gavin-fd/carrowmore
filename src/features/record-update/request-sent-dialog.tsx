import type { ComponentProps } from 'react';
import { SuccessDialog } from '@/components/ui/success-dialog';

type RequestSentDialogProps = Pick<
  ComponentProps<typeof SuccessDialog>,
  'open' | 'onOpenChange' | 'onCloseAutoFocus'
>;

export function RequestSentDialog(props: RequestSentDialogProps) {
  return (
    <SuccessDialog
      {...props}
      title="Request sent"
      description="A record update request was sent to the redeployment team. If verified, you should see an update on your profile within 5 working days. The team will be in touch should they require any more details."
    />
  );
}
