'use client';

import { useImagePreview } from '@/hooks/use-image-preview';
import { useSocket } from '@/hooks/use-socket';
import { FileUp, Send, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { FormEvent, KeyboardEvent, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import { Separator } from '../ui/separator';
import EmojiPicker from './emoji-picker';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

type ChatInputProps = {
  serverId: string;
  channelId: string;
  name: string;
  type: 'conversation' | 'channel';
};

export default function ChatInput({
  serverId,
  channelId,
  name,
  type,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('message', message);
    formData.append('channelId', channelId);
    formData.append('serverId', serverId);
    attachment && formData.append('file', attachment as File);

    setIsLoading(true);
    try {
      const response = await fetch(
        attachment ? '/api/attachment' : '/api/chat',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setMessage('');
      if (attachment) {
        setAttachment(null);
        setPreview(null);
      }
    } catch (error) {
      console.error(error);
      toast('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event as any); // TypeScript workaround for FormEvent
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setPreview(null);
  };
  const isEmpty = message.trim().length === 0;
  const isMounted = useMounted();
  useSocket();
  useImagePreview(attachment, setPreview);

  if (isMounted)
    return (
      <div className='sticky top-0 mb-3 mx-3'>
        <form
          onSubmit={sendMessage}
          className={cn(
            'bg-blue-50 dark:bg-secondary/50 p-3 rounded-md flex-col',
            isLoading && 'opacity-50'
          )}
        >
          {preview && (
            <>
              <div className='bg-background w-fit p-2 space-y-2 relative'>
                <section className='bg-background rounded-sm overflow-hidden relative size-40'>
                  <Image
                    src={preview}
                    alt={attachment?.name || 'attachment'}
                    fill
                    className='object-cover'
                  />
                </section>
                <button
                  disabled={isLoading}
                  type='button'
                  onClick={removeAttachment}
                  className='absolute -top-3 p-1 rounded-full -right-1 bg-red-700 hover:bg-red-600 disabled:pointer-events-none'
                >
                  <Trash2 className='text-white' size={20} />
                </button>
                <p className='text-sm text-zinc-500 truncate w-40'>
                  {attachment?.name}
                </p>
              </div>
              <Separator className='my-3' />
            </>
          )}

          <div className='flex items-start'>
            <TextareaAutosize
              name='message'
              className='w-full bg-transparent outline-none resize-none disabled:pointer-events-none'
              disabled={isLoading}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === 'channel' ? `Message #${name}` : `Message @${name}`
              }
              onKeyDown={handleKeyDown}
            />
            <input
              type='file'
              name='file'
              className='hidden'
              ref={fileRef}
              accept='image/*'
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file && file.type.slice(0, 5) === 'image') {
                  setAttachment(file);
                }
              }}
            />

            <EmojiPicker
              isLoading={isLoading}
              handleEmojiSelect={(emoji: string) => {
                setMessage((prev) => prev + emoji);
              }}
            />
            <button
              type='button'
              disabled={isLoading}
              onClick={() => fileRef.current?.click()}
              className='disabled:pointer-events-none hover:scale-110 transition ml-2'
            >
              <FileUp className='text-zinc-500' />
            </button>
            <button
              className={cn(
                'disabled:pointer-events-none hover:scale-110 transition ml-2',
                isEmpty && 'opacity-50'
              )}
              type='submit'
              disabled={isEmpty || isLoading}
            >
              <Send className='text-primary' />
            </button>
          </div>
        </form>
      </div>
    );
}