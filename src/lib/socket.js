import { store } from '@/app/store';
import { addNotification } from '@/features/notification/notificationSlice';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

const socket = io(import.meta.env.VITE_API_URL);

function useSocket(userId) {
    useEffect(() => {
        if (userId) {
            socket.emit('register', userId);

            socket.on('new_notification', (data) => {
                if (data) {
                    toast.success(data.title, {
                        description: data.message
                    });
                    store.dispatch(addNotification(data))
                }
            });
        }

        return () => {
            socket.disconnect();
        };
    }, [userId]);
}

export default useSocket;
