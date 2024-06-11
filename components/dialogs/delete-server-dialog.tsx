'use client';

import { deleteServer } from '@/actions/server.action';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDialog } from '@/lib/hooks/use-dialog-store';
import DeleteButton from '../buttons/delete-button';

export default function DeleteServerDialog() {
  const { open, closeDialog, type, data } = useDialog();
  const deleteServerAction = async () => {
    await deleteServer(data?.server?.id);
    closeDialog();
  };

  return (
    <AlertDialog
      open={open && type === 'deleteServer'}
      onOpenChange={closeDialog}
    >
      <AlertDialogContent>
        <form action={deleteServerAction} className='space-y-3'>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              server{' '}
              <span className='text-primary font-semibold'>
                {data?.server?.name}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <DeleteButton />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
